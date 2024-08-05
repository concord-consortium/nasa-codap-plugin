import dayjs, { Dayjs, extend } from "dayjs";
import utc from "dayjs/plugin/utc";
import dayOfYear from "dayjs/plugin/dayOfYear";
import timezone from "dayjs/plugin/timezone";
import tzlookup from "tz-lookup";
import { getSunrise, getSunset } from "sunrise-sunset-js";
import { Seasons } from "astronomy-engine";
import { DaylightInfo, DaylightCalcOptions } from "../types";
import { kBasicSummerSolstice, kEarthTilt } from "../constants";

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

function getSeasonName(dayJsDay: Dayjs, latitude: number): string {
  const year = dayJsDay.year();
  const { mar_equinox, jun_solstice, sep_equinox, dec_solstice } = Seasons(year);

  const springEq = dayjs(mar_equinox.date);
  const summerSol = dayjs(jun_solstice.date);
  const fallEq = dayjs(sep_equinox.date);
  const winterSol = dayjs(dec_solstice.date);

  let season: string;

  if (dayJsDay.isBefore(springEq) || dayJsDay.isAfter(winterSol) || dayJsDay.isSame(winterSol)) {
    season = "Winter";
  } else if (dayJsDay.isBefore(summerSol)) {
    season = "Spring";
  } else if (dayJsDay.isBefore(fallEq)) {
    season = "Summer";
  } else if (dayJsDay.isBefore(winterSol)) {
    season = "Fall";
  } else {
    throw new Error("Unable to determine season");
  }

  // Flip seasons for Southern Hemisphere
  if (latitude < 0) {
    const oppositeSeasons: { [key: string]: string } = {
      "Winter": "Summer",
      "Spring": "Fall",
      "Summer": "Winter",
      "Fall": "Spring"
    };
    return oppositeSeasons[season];
  }

  return season;
}

function getSunrayAngleInDegrees(dayNum: number, earthTilt: number, lat:number): number {
  const tiltAxisZRadians = 2 * Math.PI * (dayNum - kBasicSummerSolstice) / 365;
  const orbitalTiltDegrees = earthTilt ? earthTilt : 0;
  const effectiveTiltDegrees = -Math.cos(tiltAxisZRadians) * orbitalTiltDegrees;
  const degrees = 90 - (lat + effectiveTiltDegrees);
  return degrees;
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
      dayAsInteger: currentDay.dayOfYear(),
      season: getSeasonName(currentDay, latitude),
      sunlightAngle: getSunrayAngleInDegrees(currentDay.dayOfYear(), kEarthTilt, latitude)
    };
    results.push(record);
    currentDay = currentDay.add(1, "day");
  }

  return results;
}
