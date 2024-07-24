
export interface ILocation {
  name: string;
  latitude: number;
  longitude: number;
}

export interface DaylightInfo {
  day: Date;
  sunrise: Date;
  sunset: Date;
  dayLength: number;
  dayAsInteger: number;
}

export interface DayLightInfoOptions {
  latitude: number;
  longitude: number;
  year: number;
  // TODO: Add surface intensity, etc.
}
