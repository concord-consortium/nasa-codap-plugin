import { getSunrise, getSunset } from "sunrise-sunset-js";

interface DaylightInfo {
  day: any;
  sunrise: any;
  sunset: any;
}

// export function getSolarEventsForYearOld(latitude: number, longitude: number, year: number): SolarEvent[] {
//   const result: Array<{ type: string; date: Date | null }> = [];
//   const start = new Date(year, 0, 1).getTime();
//   for (let i = 0; i < 366; i++) {
//     const d = new Date(start + (i * 24 * 60 * 60 * 1000));
//     if (d.getFullYear() > year) break; // For non-leap year
//     result.push({ type: "sunrise", date: getSunrise(latitude, longitude, d) });
//     result.push({ type: "sunset", date: getSunset(latitude, longitude, d) });
//   }
//   return result
//     .filter((event): event is SolarEvent => event.date !== null)
//     .map(event => ({ ...event, date: event.date! })) // Non-null assertion for date
//     .sort((a, b) => a.date.getTime() - b.date.getTime());
// }


export function getSolarEventsForYear(latitude: number, longitude: number, year: number): DaylightInfo[] {
  const start = new Date(year, 0, 1).getTime();
  let results = [];
  for (let i = 0; i < 366; i++) {
    const d = new Date(start + (i * 24 * 60 * 60 * 1000));
    if (d.getFullYear() > year) break; // For non-leap year
    const sunrise = getSunrise(latitude, longitude, d);
    const sunset = getSunset(latitude, longitude, d);

    //console.log("| what is wrong? ", "\n sunrise: ",  sunrise, "\n sunset: ", sunset);
    const record = {
      day: getSimpleDate(d),
      sunrise: getTime(sunrise),
      sunset: getTime(sunset)
    };
    results.push(record);
  }
  return results;
}

/**
 * Get the time in HH:MM format
 * @param Date e.g.
 * @returns string
 */
function getTime(date: Date): string {
  return date.toTimeString().split(" ")[0];
}

/**
 * Get the date in YYYY-MM-DD format
 * @param date
 * @returns
 */
function getSimpleDate(date: Date): string {
  return date.toISOString().split("T")[0];
}
