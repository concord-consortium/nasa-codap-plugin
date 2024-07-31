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

    const userWallTimeSunrise = getSunrise(latitude, longitude, date);
    console.log("| userWallTimeSunrise: ", userWallTimeSunrise);
    const userWallTimeSunset = getSunset(latitude, longitude, date);
    const utcSunrise = dayjs.utc(userWallTimeSunrise);
    console.log("| utcSunrise: ", utcSunrise);
    const utcSunset = dayjs.utc(userWallTimeSunset);

    const targetTZSunrise: dayjs.Dayjs = useRealTimeZones
      ? utcSunrise.tz(tzlookup(latitude, longitude))
      : utcSunrise.add(Math.round(longitude / 15), "hour");

    console.log("| targetTZSunrise: ", targetTZSunrise);
    const codapSunrise = targetTZSunrise.format("YYYY-MM-DDTHH:mm:ss.SSS");
    console.log("| codapSunrise: ", codapSunrise);

    const targetTZSunset: dayjs.Dayjs = useRealTimeZones
      ? utcSunset.tz(tzlookup(latitude, longitude))
      : utcSunset.add(Math.round(longitude / 15), "hour");

    const riseSinceMidnight = targetTZSunrise.diff(targetTZSunrise.startOf("day"), "hour", true);
    const setSinceMidnight = targetTZSunset.diff(targetTZSunset.startOf("day"), "hour", true);
    const dayLength = setSinceMidnight - riseSinceMidnight;

    const record: DaylightInfo = {
      day: currentDay.format("YYYY-MM-DD"),
      sunrise: codapSunrise,
      sunset: targetTZSunset.format("YYYY-MM-DDTHH:mm:ss.SSS"),
      dayLength,
      dayAsInteger: currentDay.dayOfYear()
    };

    results.push(record);
    currentDay = currentDay.add(1, "day");
  }

  return results;
}
