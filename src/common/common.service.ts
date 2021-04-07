import { Injectable } from '@nestjs/common';
import * as NodeGeocoder from 'node-geocoder';
import { ConfigService } from '@nestjs/config';
import { GOOGLE_MAP_API_KEY } from './common.constants';

interface GetPositionOutput {
  type: string;
  coordinates: [number, number];
}

@Injectable()
export class CommonService {
  constructor(private readonly configService: ConfigService) {}

  async getPosition(address: string): Promise<GetPositionOutput> {
    const geocoder = NodeGeocoder({
      provider: 'google',
      apiKey: this.configService.get(GOOGLE_MAP_API_KEY),
    });
    const geo = await geocoder.geocode(address);

    return {
      type: 'Point',
      coordinates: [+geo[0].latitude.toFixed(3), +geo[0].longitude.toFixed(3)],
    };
  }

  async getAddress(lat: number, lng: number) {
    const geocoder = NodeGeocoder({
      provider: 'google',
      apiKey: this.configService.get(GOOGLE_MAP_API_KEY),
    });

    const address = await geocoder.reverse({ lat, lon: lng });
    return address;
  }

  distanceSql(startProperty: string, endProperty: string, km: number) {
    return `ST_Distance(${startProperty}, ST_GeomFromJSON(:${endProperty})) < ${km}`;
  }
}
