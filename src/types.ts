
export interface ILocation {
  name: string;
  latitude: number;
  longitude: number;
}

export interface LocationOptions {
  latitude: number;
  longitude: number;
  year: number;
  useRealTimeZones: boolean;
}

export interface DaylightInfo {
  day: string;
  sunrise: string;
  sunset: string;
  dayLength: number;
  dayAsInteger: number;
}

export interface GeoNameSearchOptions {
  searchString: string;
  maxRows?: number;
}

