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

    // TODO: will need to handle above arctic circle and below antarctic circle
    // Figure out what to pass when sun never sets or never rises
    // Sedondarily, will need to make dayLengths 0 and 24 respectively

    const utcSunrise = dayjs(getSunrise(latitude, longitude, date));
    const utcSunset = dayjs(getSunset(latitude, longitude, date));

    // NOTE: we might want to rip out the fake time zone option
    // and remove the useRealTimeZones flag entirely
    // but for now, we keep these conditionals in place

    const tzSunrise = useRealTimeZones
      ? utcSunrise.tz(timeZone)
      : utcSunrise.add(Math.round(longitude / 15), "hour");

    const tzSunset = useRealTimeZones
      ? utcSunset.tz(timeZone)
      : utcSunset.add(Math.round(longitude / 15), "hour");


    const utcMidnight = utcSunrise.startOf("day");
    const utcSunriseSinceMidnight = utcSunrise.diff(utcMidnight, "hour", true);
    const utcSunsetSinceMidnight = utcSunset.diff(utcMidnight, "hour", true);
    let dayLength = utcSunsetSinceMidnight - utcSunriseSinceMidnight;
    if (dayLength < 0) dayLength += 24;

    const record: DaylightInfo = {
      day: currentDay.format("YYYY-MM-DD"),
      sunrise: tzSunrise.format("YYYY-MM-DDTHH:mmZ"),
      sunset: tzSunset.format("YYYY-MM-DDTHH:mmZ"),
      dayLength,
      dayAsInteger: currentDay.dayOfYear()
    };

    results.push(record);
    currentDay = currentDay.add(1, "day");
  }

  return results;
}
