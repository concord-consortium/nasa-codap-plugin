import dayjs, { extend } from "dayjs";
import utc from "dayjs/plugin/utc";
import dayOfYear from "dayjs/plugin/dayOfYear";
import timezone from "dayjs/plugin/timezone";
/* import tzlookup from "tz-lookup"; (see comment below) */
import { getSunrise, getSunset } from "sunrise-sunset-js";
import { DaylightInfo, LocationOptions } from "../types";

extend(utc);
extend(dayOfYear);
extend(timezone);

// We pretend the world's timezones are evenly distributed and follow lines of longitude.
function hoursFromGMT(longitude: number): number {
  return Math.round(longitude / 15);
}

/**
 * Alternative function to keep for possible future use.
 * Returns the timezone-aware local time for a given UTC time.
 * Incorporates the complexities of daylight savings time and timezone lines.
 *
 * Example usage:
 * const tzAwareSunrise = utcToLocalTime(utcSunrise.toDate(), latitude, longitude);
 * console.log("| tzAwareSunrise:", tzAwareSunrise.format("HH:mm"));
 *
 * @param utcTime - The UTC time as a Date object
 * @param latitude - The latitude of the location
 * @param longitude - The longitude of the location
 * @returns A dayjs object representing the local time
 */
/*
function utcToLocalTime(utcTime: Date, latitude: number, longitude: number): dayjs.Dayjs {
  const timeZoneName = tzlookup(latitude, longitude);
  const localTZTime = dayjs(utcTime).tz(timeZoneName);
  return localTZTime;
}
*/

export function getDayLightInfo(options: LocationOptions): DaylightInfo[] {
  const { latitude, longitude, year } = options;
  const results: DaylightInfo[] = [];
  const offsetHours = hoursFromGMT(longitude);
  console.log("| offsetHours: ", offsetHours);

  let currentDay = dayjs.utc(`${year}-01-01`);
  const endOfYear = dayjs.utc(`${year + 1}-01-01`);

  while (currentDay.isBefore(endOfYear)) {
    const date = currentDay.toDate();

    const systemSunrise = getSunrise(latitude, longitude, date);
    const utcSunrise = dayjs.utc(systemSunrise);
    const localSunrise = utcSunrise.add(offsetHours, "hour");

    const systemSunset = getSunset(latitude, longitude, date);
    const utcSunset = dayjs.utc(systemSunset);
    const localSunset = utcSunset.add(offsetHours, "hour");

    // TODO: implement CODAP formulas for dayLength and dayAsInteger?
    const localSunriseSinceMidnight = localSunrise.diff(localSunrise.startOf("day"), "hour", true);
    const localSunsetSinceMidnight = localSunset.diff(localSunset.startOf("day"), "hour", true);
    const dayLength = localSunsetSinceMidnight - localSunriseSinceMidnight;

    const record: DaylightInfo = {
      day: currentDay.toDate(),
      sunrise: localSunrise.toDate(),
      sunset: localSunset.toDate(),
      dayLength,
      dayAsInteger: currentDay.dayOfYear()
    };

    results.push(record);
    currentDay = currentDay.add(1, "day");
  }

  return results;
}
