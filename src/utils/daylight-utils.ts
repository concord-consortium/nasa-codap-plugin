import { getSunrise, getSunset } from "sunrise-sunset-js";
import { DaylightInfo, DayLightInfoOptions } from "../types";

export function getDayLightInfo(options: DayLightInfoOptions): DaylightInfo[] {
  const { latitude, longitude, year } = options;
  const start = new Date(year, 0, 1).getTime();
  let results = [];
  for (let i = 0; i < 366; i++) {
    const day = new Date(start + (i * 24 * 60 * 60 * 1000));
    if (day.getFullYear() > year) break; // somehow handle leap year?
    const sunrise = getSunrise(latitude, longitude, day);
    const sunset = getSunset(latitude, longitude, day);
    const record = {
      day,
      sunrise,
      sunset,
      dayLength: getDayLength(sunrise, sunset),
      dayAsInteger: getDayOfYearAsInteger(day)
    };
    results.push(record);
  }
  return results;
}

export function getDayLength(sunrise: Date, sunset: Date): number {
  const diff = sunset.getTime() - sunrise.getTime();
  return Math.round(diff / (1000 * 60)); // Convert milliseconds to minutes and round
}

export function getDayOfYearAsInteger(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

