export interface ICodapDataContextInfo {
  id: number;
  name: string;
  title: string;
}

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
  day: string;          // read into CODAP as an ISO date
  dayOfYear: number;
  rawSunrise: string;   // read into CODAP as an ISO date
  rawSunset: string;    // read into CODAP as an ISO date
  dayLength: number;
  season: string;
  sunlightAngle: number;
  solarIntensity: number;
}

export interface GeoNameSearchOptions {
  searchString: string;
  maxRows?: number;
}

export type TabName = "location" | "glossary" | "about";
