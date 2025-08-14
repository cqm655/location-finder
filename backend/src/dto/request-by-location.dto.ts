import {
  IsArray,
  IsDateString,
  IsNumber,
  IsString,
  Validate,
  ValidationArguments,
} from 'class-validator';

export class Circle {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsNumber()
  radius: number;
}

export class Polygon {
  @IsArray()
  @IsNumber({}, { each: true })
  latitude: number[];

  @IsArray()
  @IsNumber({}, { each: true })
  longitude: number[];
}

export class RequestByLocationDto {
  @IsString()
  type: string;

  @Validate(geometryValidator)
  geometry: Circle | Polygon;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}

function geometryValidator(value: any, args: ValidationArguments) {
  const object = args.object as RequestByLocationDto;

  if (object.type === 'circle') {
    return value instanceof Circle;
  } else if (object.type === 'polygon') {
    return value instanceof Polygon;
  }
  return false;
}
