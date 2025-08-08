import * as xml2js from 'xml2js';
import * as parseDMS  from 'geo-coordinates-parser';
import {getDateTimeFormated} from "../help";

const regexLng = /(?<=lg[^0-9]).*?(?=;)/g;
const regexLat = /(?<=lt[^0-9]).*?(?=;)/g;
const regexImei = /(?<=ei=).*?(?=;)/g;
const regexImsi = /(?<=si=).*?(?=;)/g;
const regexLc = /(?<=lc=).*?(?=;)/g;
const regexMethod = /(?<=pm=).*?(?=;)/g;
const regexRadius = /(?<=rd=).*?(?=;)/g;



const parseXml = async (xml) => {
    const convert = await xml2js.parseStringPromise(xml);
    return JSON.parse(JSON.stringify(convert));
};

const parseGeoMlpCoord = async (geometry) => {
    let arr = [];
    geometry.forEach((element) => {
        const coord = parseDMS.convert(
            element.X[0].split("N")[0].concat(",", element.Y[0].split("E")[0])
        );
        const lat = coord.decimalLatitude;
        const lng = coord.decimalLongitude;
        arr.push([lat, lng]);
    });

    return arr;
};

export const parseXmlGeo = async (xml) => {
    try {
        const jsonGeo = await parseXml(xml);
        if (jsonGeo?.MobilePosition?.PositionType?.includes("MLP")) {
            const jsonGeo_ = await parseXml(
                jsonGeo.MobilePosition.MobileGeometry[0].Geometry[0]
            );

            const coord = await parseGeoMlpCoord(
                jsonGeo_.svc_result.slia[0].pos[0].pd[0].shape[0].Shape[0].Polygon[0]
                    .outerBoundaryIs[0].LinearRing[0].coord
            );

            const mlp = {
                msid: jsonGeo_.svc_result.slia[0].pos[0].msid[0],
                positionId: jsonGeo.MobilePosition.Id[0],
                timePosition: jsonGeo.MobilePosition.TimeOfPosition[0],
                formatPosition: jsonGeo.MobilePosition.PositionType[0],
                levelConfidence: jsonGeo_.svc_result.slia[0].pos[0].pd[0].lev_conf[0],
                accuracyPosition: jsonGeo.MobilePosition.MobileGeometry[0].Accuracy[0],
                geometry: coord,
            };

            return { mlp };
        } else if (jsonGeo?.MobilePosition?.PositionType?.includes("AML")) {
            if (
                jsonGeo.MobilePosition.MobileGeometry[0].Geometry[0].includes(
                    "svc_result"
                )
            ) {
                const jsonGeo_ = await parseXml(
                    jsonGeo.MobilePosition.MobileGeometry[0].Geometry[0]
                );

                const coord = await parseGeoMlpCoord(
                    jsonGeo_.svc_result.slia[0].pos[0].pd[0].shape[0].CircularArea[0]
                        .coord
                );

                const aml = {
                    imei: jsonGeo_.svc_result.slia[0].pos[0].msid[0],
                    positionId: jsonGeo.MobilePosition.Id[0],
                    timePosition: getDateTimeFormated(jsonGeo.MobilePosition.TimeOfPosition[0]),
                    formatPosition: jsonGeo.MobilePosition.PositionType[0],
                    radiusPosition:
                        jsonGeo_.svc_result.slia[0].pos[0].pd[0].shape[0].CircularArea[0]
                            .radius[0],
                    accuracyPosition:
                        jsonGeo.MobilePosition.MobileGeometry[0].Accuracy[0],
                    levelConfidence: jsonGeo_.svc_result.slia[0].pos[0].pd[0].lev_conf[0],
                    positionMethod: jsonGeo_.svc_result.slia[0].pos[0].pos_method[0],
                    geometry: coord[0],
                };

                return { aml };
            } else {
                const aml = {
                    imei: jsonGeo.MobilePosition.MobileGeometry[0]?.Geometry[0]?.match(
                        regexImei
                    )[0],
                    imsi: jsonGeo.MobilePosition.MobileGeometry[0]?.Geometry[0].match(
                        regexImsi
                    )[0],
                    positionId: jsonGeo.MobilePosition.Id[0],
                    timePosition: getDateTimeFormated(jsonGeo.MobilePosition.TimeOfPosition[0]),
                    formatPosition: jsonGeo.MobilePosition.PositionType[0],
                    radiusPosition:
                        jsonGeo.MobilePosition.MobileGeometry[0].Geometry[0].match(
                            regexRadius
                        )[0],

                    accuracyPosition:
                        jsonGeo.MobilePosition.MobileGeometry[0].Accuracy[0],
                    levelConfidence:
                        jsonGeo.MobilePosition.MobileGeometry[0].Geometry[0].match(
                            regexLc
                        )[0],

                    positionMethod:
                        jsonGeo.MobilePosition.MobileGeometry[0].Geometry[0].match(
                            regexMethod
                        )[0],
                    geometry: [
                        jsonGeo.MobilePosition.MobileGeometry[0].Geometry[0].match(
                            regexLat
                        )[0],
                        jsonGeo.MobilePosition.MobileGeometry[0].Geometry[0].match(
                            regexLng
                        )[0],
                    ],
                };
                return { aml };
            }
        } else if (jsonGeo?.Shape) {
            const coord = await parseGeoMlpCoord(
                jsonGeo.Shape.Polygon[0].outerBoundaryIs[0].LinearRing[0].coord
            );

            const mlp = {
                msid: '0000000000000',
                positionId: 0,
                timePosition: "1900-01-01T00:00:00.7592639+03:00",
                formatPosition: "MLP",
                levelConfidence: "0",
                accuracyPosition: "0",
                geometry: coord,
            };

            return { mlp };
        }
    } catch (e) {
        console.log("Error", e);
    }
};

