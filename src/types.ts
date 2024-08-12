
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
  sunrise: string | null;
  sunset: string | null;
  dayLength?: number | null;
  dayAsInteger: number;
  season: string;
  sunlightAngle: number | null;
  solarIntensity: number | null;
  sunriseMinSinceMidnight: number;
  sunsetMinSinceMidnight: number;
}

export interface GeoNameSearchOptions {
  searchString: string;
  maxRows?: number;
}

