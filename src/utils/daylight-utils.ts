import dayjs, { Dayjs, extend } from "dayjs";
import utc from "dayjs/plugin/utc";
import dayOfYear from "dayjs/plugin/dayOfYear";
import timezone from "dayjs/plugin/timezone";
import tzlookup from "tz-lookup";
import { getSunrise, getSunset } from "sunrise-sunset-js";
import { DaylightInfo, DaylightCalcOptions } from "../types";

extend(utc);
extend(dayOfYear);
extend(timezone);

function getDayLength(sunrise: Dayjs, sunset: Dayjs): number {
  const utcMidnight = sunrise.startOf("day");
  const utcSunriseSinceMidnight = sunrise.diff(utcMidnight, "hour", true);
  const utcSunsetSinceMidnight = sunset.diff(utcMidnight, "hour", true);
  let dayLength = utcSunsetSinceMidnight - utcSunriseSinceMidnight;
  return dayLength < 0 ? dayLength + 24 : dayLength;
}

export function getDayLightInfo(options: DaylightCalcOptions): DaylightInfo[] {
  const { latitude, longitude, year, useRealTimeZones } = options;
  const results: DaylightInfo[] = [];

  let currentDay = dayjs.utc(`${year}-01-01`);
  const endOfYear = dayjs.utc(`${year + 1}-01-01`);

  while (currentDay.isBefore(endOfYear)) {
    const date = currentDay.toDate();
    const timeZone = tzlookup(latitude, longitude);

    // TODO: handle above arctic circle and below antarctic circle
    const utcSunrise = dayjs(getSunrise(latitude, longitude, date));
    const utcSunset = dayjs(getSunset(latitude, longitude, date));

    // TODO: Consider removing fake timezone option entirely
    const tzSunrise = useRealTimeZones
      ? utcSunrise.tz(timeZone)
      : utcSunrise.add(Math.round(longitude / 15), "hour");

    const tzSunset = useRealTimeZones
      ? utcSunset.tz(timeZone)
      : utcSunset.add(Math.round(longitude / 15), "hour");

    const record: DaylightInfo = {
      day: currentDay.format("YYYY-MM-DD"),
      sunrise: tzSunrise.format("YYYY-MM-DDTHH:mmZ"),
      sunset: tzSunset.format("YYYY-MM-DDTHH:mmZ"),
      dayLength: getDayLength(tzSunrise, tzSunset),
      dayAsInteger: currentDay.dayOfYear()
    };
    results.push(record);
    currentDay = currentDay.add(1, "day");
  }

  return results;
}
