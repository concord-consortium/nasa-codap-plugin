
export interface ILocation {
  name: string;
  latitude: number;
  longitude: number;
}

export interface DaylightCalcOptions {
  latitude: number;
  longitude: number;
  year: number;
}

export interface DaylightInfo {
  day: string; // read into CODAP as an ISO date
  sunrise: string;
  sunset: string;
  dayLength: number;
  dayAsInteger: number;
  season: string;
  sunlightAngle: number;
  solarIntensity: number;
  sunriseMinSinceMidnight: number;
  sunsetMinSinceMidnight: number;
}

export interface GeoNameSearchOptions {
  searchString: string;
  maxRows?: number;
}

