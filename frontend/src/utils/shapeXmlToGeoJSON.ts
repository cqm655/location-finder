import type {FeatureCollection, Geometry} from "geojson";

export type ParsedMobilePosition =
    | { type: "AML"; feature: FeatureCollection<Geometry>; }
    | { type: "MLP"; feature: FeatureCollection<Geometry>; }

// @ts-ignore
export function parseMobilePosition(xmlString: string): ParsedMobilePosition {
    // === AML ===
    if (xmlString.includes("<Format>AML</Format>") || xmlString.includes("ML=1;")) {
        const match = xmlString.match(/lt=\+?([\d.]+);lg=\+?([\d.]+)/);

        const lat = parseFloat(match![1]);
        const lon = parseFloat(match![2]);

        return {
            type: "AML",
            feature: {
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        geometry: {type: "Point", coordinates: [lon, lat]},
                        properties: {},
                    },
                ],
            },
        };
    }

    if (xmlString.includes("<Format>MLP</Format>") || xmlString.includes("<Shape><Polygon>")) {
        const coords: [number, number][] = [];
        const coordRegex = /<X>(.*?)<\/X>\s*<Y>(.*?)<\/Y>/g;
        let match: RegExpExecArray | null;

        while ((match = coordRegex.exec(xmlString)) !== null) {
            const lat = dmsToDecimal(match[1]);
            const lon = dmsToDecimal(match[2]);
            if (lat !== null && lon !== null) {
                coords.push([lon, lat]);
            }
        }


        return {
            type: "MLP",
            feature: {
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        geometry: {
                            type: "Polygon",
                            coordinates: [coords],
                        },
                        properties: {},
                    },
                ],
            },
        };

    }


}

// helper pentru conversia DMS -> decimal
function dmsToDecimal(dms: string): number | null {
    // Exemplu: "47 12 16.518N" sau "28 35 21.99E"
    const regex = /(\d+)\s+(\d+)\s+([\d.]+)([NSEW])/;
    const match = dms.match(regex);
    if (!match) return null;

    const deg = parseInt(match[1], 10);
    const min = parseInt(match[2], 10);
    const sec = parseFloat(match[3]);
    const dir = match[4];

    let decimal = deg + min / 60 + sec / 3600;
    if (dir === "S" || dir === "W") {
        decimal *= -1;
    }
    return decimal;
}
