import dayjs, { extend } from "dayjs";
import utc from "dayjs/plugin/utc";
import dayOfYear from "dayjs/plugin/dayOfYear";
import timezone from "dayjs/plugin/timezone";
import tzlookup from "tz-lookup";
import { getSunrise, getSunset } from "sunrise-sunset-js";
import { DaylightInfo, LocationOptions } from "../types";

extend(utc);
extend(dayOfYear);
extend(timezone);

// If useRealTimeZones is true, and our times will be authentic local times.
function utcToLocalTime(utcTime: Date, latitude: number, longitude: number): dayjs.Dayjs {
  const timeZoneName = tzlookup(latitude, longitude);
  return dayjs(utcTime).tz(timeZoneName);
}

// If useRealTimeZones is false, we pretend the world's timezones are evenly distributed
// and faithfully follow lines of longitude, and our time will be calculated based on this assumption.
function hoursFromGMT(longitude: number): number {
  return Math.round(longitude / 15);
}

function formatLocalTime(time: dayjs.Dayjs): string {
  return time.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
}

export function getDayLightInfo(options: LocationOptions): DaylightInfo[] {
  const { latitude, longitude, year, useRealTimeZones } = options;
  const results: DaylightInfo[] = [];

  const offsetHours = hoursFromGMT(longitude);

  let currentDay = dayjs.utc(`${year}-01-01`);
  const endOfYear = dayjs.utc(`${year + 1}-01-01`);

  while (currentDay.isBefore(endOfYear)) {
    const date = currentDay.toDate();

    const systemSunrise = getSunrise(latitude, longitude, date);
    const systemSunset = getSunset(latitude, longitude, date);

    let localSunrise: dayjs.Dayjs;
    let localSunset: dayjs.Dayjs;

    if (useRealTimeZones) {
      localSunrise = utcToLocalTime(systemSunrise, latitude, longitude);
      localSunset = utcToLocalTime(systemSunset, latitude, longitude);
    } else {
      localSunrise = dayjs.utc(systemSunrise).add(offsetHours, "hour");
      localSunset = dayjs.utc(systemSunset).add(offsetHours, "hour");
    }

    const localSunriseSinceMidnight = localSunrise.diff(localSunrise.startOf("day"), "hour", true);
    const localSunsetSinceMidnight = localSunset.diff(localSunset.startOf("day"), "hour", true);
    const dayLength = localSunsetSinceMidnight - localSunriseSinceMidnight;

    const record: DaylightInfo = {
      day: currentDay.format("YYYY-MM-DD"),
      sunrise: formatLocalTime(localSunrise),
      sunset: formatLocalTime(localSunset),
      dayLength,
      dayAsInteger: currentDay.dayOfYear()
    };

    results.push(record);
    currentDay = currentDay.add(1, "day");
  }

  return results;
}
