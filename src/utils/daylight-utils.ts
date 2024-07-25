import dayjs, { extend } from "dayjs";
import utc from "dayjs/plugin/utc";
import dayOfYear from "dayjs/plugin/dayOfYear";
import timezone from "dayjs/plugin/timezone";
import tzlookup from "tz-lookup";
import { getSunrise, getSunset } from "sunrise-sunset-js";
import { DaylightInfo, DayLightInfoOptions } from "../types";

extend(utc);
extend(dayOfYear);
extend(timezone);

// We pretend the world's timezones are evenly distributed and follow lines of longitude.
function hoursFromGMT(longitude: number): number {
  return Math.round(longitude / 15);
}

// alternative function to keep around, but not currently used
// returns the timezone-aware local time for a given UTC time
// So, it incorporates the weirdness of daylight savings time and timezone lines
// E.g.
//     const tzAwareSunrise = utcToLocalTime(utcSunrise.toDate(), latitude, longitude);
//     console.log("| tzAwareSunrise:", tzAwareSunrise.format("HH:mm"));
//
function utcToLocalTime(utcTime: Date, latitude: number, longitude: number): any {
  const timeZoneName = tzlookup(latitude, longitude);
  const localTZTime = dayjs(utcTime).tz(timeZoneName);
  return localTZTime;
}

export function getDayLightInfo(options: DayLightInfoOptions): DaylightInfo[] {
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

    // TODO: implement CODAP formulas for dayLength and dayAsInteger
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
