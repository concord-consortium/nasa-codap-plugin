
export interface ILocation {
  name: string;
  latitude: number;
  longitude: number;
}

export interface LocationOptions {
  latitude: number;
  longitude: number;
  year: number;
}

export interface DaylightInfo {
  day: Date;
  sunrise: Date;
  sunset: Date;
  dayLength: number;
  dayAsInteger: number;
}

export interface GeoNameSearchOptions {
  searchString: string;
  maxRows?: number;
}

