import {
  Circle,
  Polygon,
  RequestByLocationDto,
} from '../../dto/request-by-location.dto';
import Database from '../../db/source.database';
import { TYPES } from 'tedious';
import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { getInfoCasesByArea } from '../../db/scripts/get-info-cases';

export interface InfoByLocationResponse {
  caseFolderId: number;
  caseTypeId: number;
  caseTypeName: string;
  created: string;
  XCoordinate: number;
  YCoordinate: number;
  caseIndex1Name: string;
  caseIndex2Name: string;
}

interface ParamList {
  startDate: string;
  endDate: string;
  Xmax: number;
  Xmin: number;
  Ymax: number;
  Ymin: number;
}

interface CoordinateLimits {
  Xmin: number;
  Xmax: number;
  Ymin: number;
  Ymax: number;
}

type Point = { latitude: number; longitude: number };

@Injectable()
export class GetCasesByArea {
  constructor() {}

  public async getCasesInformation(
    requestByLocationDto: RequestByLocationDto,
  ): Promise<InfoByLocationResponse[]> {
    let response: InfoByLocationResponse[] = [];
    if (requestByLocationDto.startDate && requestByLocationDto.endDate) {
      switch (requestByLocationDto.type) {
        case 'circle':
          response = await this.getRequestByCircle(requestByLocationDto);
          break;
        case 'polygon':
          response = await this.getRequestByPolygon(requestByLocationDto);
          break;
        default:
          response = [];
      }
    }
    return response;
  }

  private async getRequestByCircle(
    requestByLocationDto: RequestByLocationDto,
  ): Promise<InfoByLocationResponse[]> {
    const query = getInfoCasesByArea;

    const geometry = requestByLocationDto.geometry as Circle;
    const XCoordinate = geometry.lat;
    const YCoordinate = geometry.lng;
    const radius = geometry.radius;
    const coordinates = this.getMinMaxCoordinateByCircle(
      XCoordinate,
      YCoordinate,
      radius,
    );

    if (coordinates === null) {
      return [];
    }

    const params: ParamList = {
      startDate: requestByLocationDto.startDate,
      endDate: requestByLocationDto.endDate,
      Xmax: coordinates.Xmax,
      Xmin: coordinates.Xmin,
      Ymax: coordinates.Ymax,
      Ymin: coordinates.Ymin,
    };

    const results = await this.getDataByArea(params, query);

    const filteredResults: InfoByLocationResponse[] = [];

    for (const result of results) {
      const haversineResponse = this.haversineDistance(
        XCoordinate,
        YCoordinate,
        result.XCoordinate,
        result.YCoordinate,
      );
      if (haversineResponse <= radius) {
        filteredResults.push(result);
      }
    }

    return filteredResults;
  }

  private async getRequestByPolygon(
    requestByLocationDto: RequestByLocationDto,
  ): Promise<InfoByLocationResponse[]> {
    const query = getInfoCasesByArea;
    const geometry: Polygon = requestByLocationDto.geometry as Polygon;
    const XCoordinates = geometry.latitude;
    const YCoordinates = geometry.longitude;
    const polygon: Polygon = {
      latitude: XCoordinates,
      longitude: YCoordinates,
    };

    const coordinates = this.getLimitsByPolygon(XCoordinates, YCoordinates);

    if (coordinates === null) {
      return [];
    }

    const params: ParamList = {
      startDate: requestByLocationDto.startDate,
      endDate: requestByLocationDto.endDate,
      Xmax: coordinates.Xmax,
      Xmin: coordinates.Xmin,
      Ymax: coordinates.Ymax,
      Ymin: coordinates.Ymin,
    };

    const results = await this.getDataByArea(params, query);

    const filteredResults: InfoByLocationResponse[] = [];

    for (const result of results) {
      const isInside = this.isPointInPolygon(
        { latitude: result.XCoordinate, longitude: result.YCoordinate },
        polygon,
      );
      if (isInside) {
        filteredResults.push(result);
      }
    }
    return filteredResults;
  }

  private getMinMaxCoordinateByCircle(
    XCoordinate: number,
    YCoordinate: number,
    radius: number,
  ): CoordinateLimits {
    const metersPerDegreeLat = 111320;
    const metersPerDegreeLon =
      metersPerDegreeLat * Math.cos((XCoordinate * Math.PI) / 180);

    const latitudeMax = XCoordinate + radius / metersPerDegreeLat;
    const latitudeMin = XCoordinate - radius / metersPerDegreeLat;
    const longitudeMax = YCoordinate + radius / metersPerDegreeLon;
    const longitudeMin = YCoordinate - radius / metersPerDegreeLon;

    return {
      Xmax: latitudeMax,
      Xmin: latitudeMin,
      Ymax: longitudeMax,
      Ymin: longitudeMin,
    };
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const R = 6371e3;
    const f1 = this.toRadians(lat1);
    const f2 = this.toRadians(lat2);
    const deltaF = this.toRadians(lat2 - lat1);
    const deltaLambda = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(deltaF / 2) * Math.sin(deltaF / 2) +
      Math.cos(f1) *
        Math.cos(f2) *
        Math.sin(deltaLambda / 2) *
        Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private getLimitsByPolygon(
    XCoordinates: number[],
    YCoordinates: number[],
  ): CoordinateLimits {
    if (YCoordinates.length === 0 || YCoordinates.length === 0) {
      return null;
    }

    const Xmax = Math.max(...XCoordinates);
    const Xmin = Math.min(...XCoordinates);
    const Ymax = Math.max(...YCoordinates);
    const Ymin = Math.min(...YCoordinates);

    return {
      Xmax,
      Xmin,
      Ymax,
      Ymin,
    };
  }

  private isPointInPolygon(point: Point, polygon: Polygon): boolean {
    let inside = false;
    const { latitude, longitude } = point;

    const latArr = polygon.latitude;
    const lonArr = polygon.longitude;

    if (!latArr || !lonArr || latArr.length === 0 || lonArr.length === 0) {
      return false; // poligon invalid
    }

    for (let i = 0, j = latArr.length - 1; i < latArr.length; j = i++) {
      const lat1 = latArr[i];
      const lon1 = lonArr[i];
      const lat2 = latArr[j];
      const lon2 = lonArr[j];

      const intersect =
        lat1 > latitude !== lat2 > latitude &&
        longitude < ((lon2 - lon1) * (latitude - lat1)) / (lat2 - lat1) + lon1;

      if (intersect) {
        inside = !inside;
      }
    }
    return inside;
  }

  private async getDataByArea(
    requestParam: ParamList,
    query: string,
  ): Promise<InfoByLocationResponse[]> {
    const startDate = DateTime.fromISO(requestParam.startDate).toFormat(
      'yyyy-MM-dd HH:mm:ss',
    );
    const endDate = DateTime.fromISO(requestParam.endDate).toFormat(
      'yyyy-MM-dd HH:mm:ss',
    );

    const db = new Database();
    try {
      await db.connect();

      const results = await db.executeQuery(query, [
        { name: 'startDate', type: TYPES.DateTime, value: startDate },
        { name: 'endDate', type: TYPES.DateTime, value: endDate },
        { name: 'X_max', type: TYPES.Float, value: requestParam.Xmax },
        { name: 'X_min', type: TYPES.Float, value: requestParam.Xmin },
        { name: 'Y_max', type: TYPES.Float, value: requestParam.Ymax },
        { name: 'Y_min', type: TYPES.Float, value: requestParam.Ymin },
      ]);
      return results;
    } catch (err) {
      throw err;
    } finally {
      db.close();
    }
  }
}
