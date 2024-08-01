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

export function getDayLightInfo(options: LocationOptions): DaylightInfo[] {
  const { latitude, longitude, year, useRealTimeZones } = options;
  const results: DaylightInfo[] = [];

  let currentDay = dayjs.utc(`${year}-01-01`);
  const endOfYear = dayjs.utc(`${year + 1}-01-01`);

  while (currentDay.isBefore(endOfYear)) {
    const date = currentDay.toDate();
    const timeZone = tzlookup(latitude, longitude);

    const utcSunrise = dayjs(getSunrise(latitude, longitude, date));
    const utcSunset = dayjs(getSunset(latitude, longitude, date));
    const tzSunrise = utcSunrise.tz(timeZone);
    const tzSunset = utcSunset.tz(timeZone);

    const record: DaylightInfo = {
      day: currentDay.format("YYYY-MM-DD"),
      sunrise: tzSunrise.format("YYYY-MM-DDTHH:mmZ"),
      sunset: tzSunset.format("YYYY-MM-DDTHH:mmZ"),
      dayLength: tzSunset.diff(tzSunrise, "hour", true),
      dayAsInteger: currentDay.dayOfYear()
    };

    results.push(record);
    currentDay = currentDay.add(1, "day");
  }

  return results;
}
