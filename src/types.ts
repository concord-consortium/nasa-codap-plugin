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
  startDate: string;
  endDate: string;
}

export interface DaylightInfo {
  day: string;          // read into CODAP as an ISO date
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

// Data types

export type Units = "metric" | "imperial";

export type NASAParameter = "ALLSKY_SFC_UV_INDEX" | "CLRSKY_SFC_SW_DWN" | "T2M_MAX" | "TS_MAX" | "PRECTOTCORR" | "CLOUD_AMT_DAY" | "GWETPROF";

export type AttributeCategory = "Sunlight" | "Temperature" | "Water Availability";

export interface IAttribute {
  name: string;
  title: string;
  type: string;
  unit?: {
    metric: string;
    imperial: string;
    metricToImperial?: (value: number) => number;
  };
  precision?: string;
  formula?: string;
  description?: string;
  hidden?: boolean;
  NASAParamName?: NASAParameter;
  category?: AttributeCategory;
}
