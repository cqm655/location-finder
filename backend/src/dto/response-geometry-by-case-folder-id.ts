import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class GeometryDto {
  @IsNumber({}, { each: true })
  @IsArray()
  coordinates: number[];
}

export class ShapeResponseDto {
  @IsString()
  accuracyPosition: string;

  @IsString()
  formatPosition: string;

  @IsArray()
  @Type(() => GeometryDto)
  geometry: [];

  @IsString()
  levelConfidence: string;

  @IsNumber()
  msid: number;

  @IsNumber()
  positionId: number;

  @IsString()
  provider: string;

  @IsDateString()
  timePosition: string;

  @IsOptional()
  @IsString()
  imei?: string;

  @IsOptional()
  @IsString()
  imsi?: string;

  @IsOptional()
  @IsString()
  positionMethod?: string;

  @IsOptional()
  @IsString()
  radiusPosition?: string;
}
