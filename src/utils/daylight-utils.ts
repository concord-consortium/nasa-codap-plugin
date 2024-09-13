import dayjs, { Dayjs, extend } from "dayjs";
import utc from "dayjs/plugin/utc";
import dayOfYear from "dayjs/plugin/dayOfYear";
import timezone from "dayjs/plugin/timezone";
import tzlookup from "tz-lookup";
import { getSunrise, getSunset } from "sunrise-sunset-js";
import { Seasons } from "astronomy-engine";
import { DaylightInfo, DaylightCalcOptions, ILocation } from "../types";
import { kBasicSummerSolstice, kDateFormats, kDateWithTimeFormats, kEarthTilt, kAdjustSpringForwardOutlier } from "../constants";

extend(utc);
extend(dayOfYear);
extend(timezone);


function getDayLength(sunrise: Dayjs, sunset: Dayjs): number {
  const utcSunrise = sunrise.utc(true);
  const utcSunset = sunset.utc(true);

  const utcMidnight = utcSunrise.startOf("day");

  const utcSunriseSinceMidnight = utcSunrise.diff(utcMidnight, "hour", true);
  const utcSunsetSinceMidnight = utcSunset.diff(utcMidnight, "hour", true);

  const initialDayLength = utcSunsetSinceMidnight - utcSunriseSinceMidnight;
  const dayLength = initialDayLength < 0 ? initialDayLength + 24 : initialDayLength;

  return dayLength;
}

function hasDST(latitude: number, longitude: number, year: number): boolean {
  const timeZone = tzlookup(latitude, longitude);
  const winterDate = dayjs.tz(`${year}-01-01`, timeZone);
  const summerDate = dayjs.tz(`${year}-07-01`, timeZone);

  return winterDate.utcOffset() !== summerDate.utcOffset();
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

export function getSolarNoonIntensity(dayNum: number, latitude: number): number {
  const solarConstant = 1361;
  const latitudeRad = latitude * Math.PI / 180;
  const declination = 23.45 * Math.sin((360/365) * (dayNum - 81) * Math.PI / 180);
  const declinationRad = declination * Math.PI / 180;
  const dayAngle = 2 * Math.PI * (dayNum - 1) / 365;
  const eccentricityFactor = 1 + 0.033 * Math.cos(dayAngle); // correction factor for Earth's elliptical orbit
  const cosSolarZenithAngle = Math.sin(latitudeRad) * Math.sin(declinationRad) +
                              Math.cos(latitudeRad) * Math.cos(declinationRad);

  const solarNoonIntensity = solarConstant * eccentricityFactor * cosSolarZenithAngle;

  // Note: This calculation returns theoretical intensity at the top of the atmosphere.
  // Negative values are clamped to zero, which
  // represents times when the sun is below the horizon
  // In reality, some diffuse light might still be present due to atmospheric scattering.
  // None of the calculations in this plugin use "civil twilight" or associated definitions
  // For day length either, so this is consistent with the rest of the calculations.
  return Math.max(0, solarNoonIntensity);
}

export function getSunrayAngleInDegrees(dayNum: number, earthTilt: number, lat:number): number {
  const tiltAxisZRadians = 2 * Math.PI * (dayNum - kBasicSummerSolstice) / 365;
  const orbitalTiltDegrees = earthTilt ? earthTilt : 0;
  const effectiveTiltDegrees = -Math.cos(tiltAxisZRadians) * orbitalTiltDegrees;
  const degrees = 90 - (lat + effectiveTiltDegrees);
  return degrees;
}

export function getMinutesSinceMidnight(time: Dayjs): number {
  return !time.isValid() ? 0 : time.hour() * 60 + time.minute();
}

export function getDayLightInfo(options: DaylightCalcOptions): DaylightInfo[] {
  const { latitude, longitude, startDate, endDate } = options;
  const results: DaylightInfo[] = [];

  const timeZone = tzlookup(latitude, longitude);
  let currentDay = dayjs.tz(startDate, timeZone).startOf("day");
  const endDay = dayjs.tz(endDate, timeZone).startOf("day");

  while (currentDay.isBefore(endDay)) {
    const noonDate = currentDay.hour(12).toDate();
    const utcSunrise = dayjs.utc(getSunrise(latitude, longitude, noonDate));
    const utcSunset = dayjs.utc(getSunset(latitude, longitude, noonDate));
    const seasonName = getSeasonName(currentDay, latitude);
    const localSunriseObj = utcSunrise.tz(timeZone);
    const localSunsetObj = utcSunset.tz(timeZone);

    // Transition days for midnight sun or polar night periods
    const startPolarSummer = localSunriseObj.isValid() && !localSunsetObj.isValid();
    const startPolarWinter = !localSunriseObj.isValid() && localSunsetObj.isValid();
    const midPolar = !localSunriseObj.isValid() && !localSunsetObj.isValid();
    const midPolarWinter = midPolar && (seasonName === "Winter" || seasonName === "Fall");
    const midPolarSummer = midPolar && (seasonName === "Summer" || seasonName === "Spring");

    let finalDayLength = 0;

    if (midPolarSummer) {
      finalDayLength = 24;
    }
    else if (midPolarWinter) {
      finalDayLength = 0;
    }
    else if (startPolarSummer) {
      finalDayLength = 24 - getMinutesSinceMidnight(localSunriseObj) / 60;
    }
    else if (startPolarWinter) {
      finalDayLength = getMinutesSinceMidnight(localSunsetObj) / 60;
    }
    else {
      finalDayLength = getDayLength(localSunriseObj, localSunsetObj);
      // Optional adjustment of outlier on spring forward day for some timezones
      if (kAdjustSpringForwardOutlier) {
        const year = currentDay.year();
        const isSpringForward = localSunriseObj.utcOffset() < localSunsetObj.utcOffset();
        if (hasDST(latitude, longitude, year) && isSpringForward) finalDayLength -= 1;
      }
    }

    const record: DaylightInfo = {
      day: currentDay.format(kDateFormats.asLocalISODate),
      rawSunrise: localSunriseObj.format(kDateWithTimeFormats.asLocalISOWithTZOffset),
      rawSunset: localSunsetObj.format(kDateWithTimeFormats.asLocalISOWithTZOffset),
      dayLength: finalDayLength,
      season: seasonName,
      sunlightAngle: getSunrayAngleInDegrees(currentDay.dayOfYear(), kEarthTilt, latitude),
      solarIntensity: getSolarNoonIntensity(currentDay.dayOfYear(), latitude)
    };
    results.push(record);
    currentDay = currentDay.add(1, "day");
  }
  return results;
}

// Tolerance is currently used mostly to account for floating point errors. However, we can also use it to match
// locations with some degree of error, e.g. when user is manually entering a location and hoping to match one of the
// saved locations.
export function locationsEqual(a?: ILocation | null, b?: ILocation | null, tolerance: number = 1e-5): boolean {
  if (!a || !b) return false;
  const latitudeEqual = Math.abs(a.latitude - b.latitude) < tolerance;
  const longitudeEqual = Math.abs(a.longitude - b.longitude) < tolerance;
  return latitudeEqual && longitudeEqual;
}

export function isValidLongitude(longitude: string): boolean {
  const parsed = Number(longitude);
  return !isNaN(parsed) && parsed >= -180 && parsed <= 180;
}

export function isValidLatitude(latitude: string): boolean {
  const parsed = Number(latitude);
  return !isNaN(parsed) && parsed >= -90 && parsed <= 90;
}

export function formatLatLongNumber(value: number | string) {
  // This function ensures that the number is formatted up to 5 decimal points and removes any trailing zeros and
  // the decimal point if not necessary.
  return Number(value).toFixed(2).replace(/\.?0+$/, "");
}

export function limitLatitude(value: number): number {
  return Math.min(90, Math.max(-90, value));
}

export function limitLongitude(value: number): number {
  return Math.min(180, Math.max(-180, value));
}

export function changeMonthOfDayOfYear(dayOfYearIndex: number, monthsToAdd: number): number {
  if (dayOfYearIndex < 0 || dayOfYearIndex >= 365) {
      throw new Error("dayOfYearIndex must be between 0 and 364");
  }

  // Days in each month for a leap year
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Calculate the current month and the day of the month
  let accumulatedDays = 0;
  let currentMonth = 0;
  for (currentMonth = 0; currentMonth < daysInMonth.length; currentMonth++) {
      if (dayOfYearIndex < accumulatedDays + daysInMonth[currentMonth]) {
          break;
      }
      accumulatedDays += daysInMonth[currentMonth];
  }

  const dayOfMonth = dayOfYearIndex - accumulatedDays;
  let newMonth = (currentMonth + monthsToAdd + 12) % 12;

  let newDayOfYearIndex = dayOfMonth;
  for (let i = 0; i < newMonth; i++) {
      newDayOfYearIndex += daysInMonth[i];
  }

  return newDayOfYearIndex % 365;
}
