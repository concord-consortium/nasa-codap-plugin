
export interface ILocation {
  name: string;
  latitude: number;
  longitude: number;
  coordinatePair?: string;
}

export interface DaylightCalcOptions {
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
  season: string;
  sunlightAngle: number;
  solarIntensity: number;
}

export interface GeoNameSearchOptions {
  searchString: string;
  maxRows?: number;
}

