// import type { FeatureCollection, Geometry } from "geojson";
//
// export type ParsedMobilePosition = {
//     type: "AML" | "MLP";
//     feature: FeatureCollection<Geometry>;
//     time: string | null; // Adăugăm câmpul de timp
// }
//
// export function parseMobilePosition(xmlString: string): ParsedMobilePosition | null {
//     if (!xmlString) return null;
//
//     // 1. Extragere Timp (Prioritate pe Time, fallback pe TimeOfPosition)
//     const timeMatch = xmlString.match(/<Time>(.*?)<\/Time>/) || xmlString.match(/<TimeOfPosition>(.*?)<\/TimeOfPosition>/);
//     const timestamp = timeMatch ? timeMatch[1] : null;
//
//     // 2. Extragere WKT
//     const wktMatch = xmlString.match(/<GeometryAsWkt>(.*?)<\/GeometryAsWkt>/);
//     const wkt = wktMatch ? wktMatch[1].toUpperCase() : null;
//
//     // 3. Determinare Tip (Dacă e Polygon, îl forțăm ca MLP pentru vizualizare)
//     let type: "AML" | "MLP" = "AML";
//     if (wkt?.includes("POLYGON") || xmlString.includes("<Format>MLP</Format>")) {
//         type = "MLP";
//     }
//
//     // 4. Parsare Geometrie din WKT
//     if (wkt) {
//         const geometry = parseWKT(wkt);
//         if (geometry) {
//             return {
//                 type,
//                 time: timestamp,
//                 feature: {
//                     type: "FeatureCollection",
//                     features: [{ type: "Feature", geometry, properties: { timestamp } }]
//                 }
//             };
//         }
//     }
//
//     // 5. Fallback pe coordonate brute (lt/lg)
//     const amlMatch = xmlString.match(/lt=\+?([\d.]+);lg=\+?([\d.]+)/);
//     if (amlMatch) {
//         return {
//             type: "AML",
//             time: timestamp,
//             feature: {
//                 type: "FeatureCollection",
//                 features: [{
//                     type: "Feature",
//                     geometry: { type: "Point", coordinates: [parseFloat(amlMatch[2]), parseFloat(amlMatch[1])] },
//                     properties: { timestamp }
//                 }]
//             }
//         };
//     }
//
//     return null;
// }
//
// /**
//  * Helper WKT Parser
//  */
// function parseWKT(wkt: string): Geometry | null {
//     const cleanWkt = wkt.trim().toUpperCase();
//
//     if (cleanWkt.startsWith("POINT")) {
//         const match = cleanWkt.match(/POINT\s*\(\s*([\d.-]+)\s+([\d.-]+)\s*\)/);
//         if (match) return { type: "Point", coordinates: [parseFloat(match[1]), parseFloat(match[2])] };
//     }
//
//     if (cleanWkt.startsWith("POLYGON")) {
//         const contentMatch = cleanWkt.match(/\(\s*\((.*?)\)\s*\)/);
//         if (contentMatch) {
//             const pairs = contentMatch[1].split(",");
//             const coordinates = pairs.map(pair => {
//                 const parts = pair.trim().split(/\s+/);
//                 return [parseFloat(parts[0]), parseFloat(parts[1])] as [number, number];
//             });
//             return { type: "Polygon", coordinates: [coordinates] };
//         }
//     }
//     return null;
// }

import type {FeatureCollection, Geometry} from "geojson";

export type ParsedMobilePosition = {
    type: "AML" | "MLP";
    feature: FeatureCollection<Geometry>;
    time: string | null;
    networkInfo?: {
        mcc: string | null;
        mnc: string | null;
        cellId: string | null;
    };
}

export function parseMobilePosition(xmlString: string): ParsedMobilePosition | null {
    if (!xmlString) return null;

    // 1. Extragere Timp
    const timeMatch = xmlString.match(/<(?:Time|TimeOfPosition|time)>(.*?)<\/(?:Time|TimeOfPosition|time)>/);
    const timestamp = timeMatch ? timeMatch[1] : null;

    // 2. Extragere WKT și Tip
    const wktMatch = xmlString.match(/<GeometryAsWkt>(.*?)<\/GeometryAsWkt>/);
    const wkt = wktMatch ? wktMatch[1].toUpperCase() : null;

    // Determinăm dacă este MLP (Network/Polygon) sau AML (GPS/Point)
    let type: "AML" | "MLP" = xmlString.includes("<Format>MLP</Format>") ? "MLP" : "AML";
    if (wkt?.includes("POLYGON")) type = "MLP";

    // 3. Extragere date CellID / Rețea (mcc, mnc, ml)
    // Căutăm în tag-ul <Geometry> care conține stringul de parametri
    const geometryTagMatch = xmlString.match(/<Geometry>(.*?)<\/Geometry>/);
    let networkInfo = undefined;

    if (geometryTagMatch) {
        const geoContent = geometryTagMatch[1];
        networkInfo = {
            mcc: geoContent.match(/mcc=(\d+)/)?.[1] || null,
            mnc: geoContent.match(/mnc=(\d+)/)?.[1] || null,
            cellId: geoContent.match(/ml=(\d+)/)?.[1] || null, // 'ml' reprezintă Cell ID în protocolul AML
        };
    }

    // 4. Construcție Geometrie
    let geometry: Geometry | null = null;
    if (wkt) {
        geometry = parseWKT(wkt);
    } else if (xmlString.includes("lt=") && xmlString.includes("lg=")) {
        // Fallback pentru AML coordonate brute
        const lt = xmlString.match(/lt=([\d.]+)/)?.[1];
        const lg = xmlString.match(/lg=([\d.]+)/)?.[1];
        if (lt && lg) geometry = {type: "Point", coordinates: [parseFloat(lg), parseFloat(lt)]};
    } else if (xmlString.includes("<coord>")) {
        // Fallback pentru MLP vechi (DMS)
        geometry = parseMLPCoords(xmlString);
    }

    if (!geometry) return null;

    return {
        type,
        time: timestamp,
        networkInfo,
        feature: {
            type: "FeatureCollection",
            features: [{
                type: "Feature",
                geometry,
                properties: {
                    timestamp,
                    ...networkInfo,
                    method: xmlString.match(/<LocationMethod>(.*?)<\/LocationMethod>/)?.[1] || "Unknown"
                }
            }]
        }
    };
}

// Helper pentru parsare MLP (coord X/Y din LinearRing)
function parseMLPCoords(xml: string): Geometry | null {
    const coords: [number, number][] = [];
    const coordRegex = /&lt;coord&gt;&lt;X&gt;(.*?)&lt;\/X&gt;&lt;Y&gt;(.*?)&lt;\/Y&gt;&lt;\/coord&gt;/g;
    let match;
    while ((match = coordRegex.exec(xml)) !== null) {
        const lat = dmsToDecimal(match[1]);
        const lon = dmsToDecimal(match[2]);
        if (lat && lon) coords.push([lon, lat]);
    }
    return coords.length > 0 ? {type: "Polygon", coordinates: [coords]} : null;
}

// Funcția DMS to Decimal (refolosită din versiunile anterioare)
function dmsToDecimal(dms: string): number | null {
    const regex = /(\d+)\s+(\d+)\s+([\d.]+)([NSEW])/;
    const match = dms.match(regex);
    if (!match) return null;
    const dec = parseInt(match[1]) + parseInt(match[2]) / 60 + parseFloat(match[3]) / 3600;
    return (match[4] === "S" || match[4] === "W") ? -dec : dec;
}

function parseWKT(wkt: string): Geometry | null {
    if (wkt.startsWith("POINT")) {
        const m = wkt.match(/POINT\s*\(\s*([\d.-]+)\s+([\d.-]+)\s*\)/);
        return m ? {type: "Point", coordinates: [parseFloat(m[1]), parseFloat(m[2])]} : null;
    }
    if (wkt.startsWith("POLYGON")) {
        const m = wkt.match(/\(\s*\((.*?)\)\s*\)/);
        if (!m) return null;
        const coords = m[1].split(",").map(p => p.trim().split(/\s+/).map(Number) as [number, number]);
        return {type: "Polygon", coordinates: [coords]};
    }
    return null;
}
