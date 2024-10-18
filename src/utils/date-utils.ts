const padNumber = (num: number): string => num.toString().padStart(2, "0");
const dateToString = (d: Date) => `${d.getFullYear()}-${padNumber(d.getMonth() + 1)}-${padNumber(d.getDate())}`

const yesterdayDate = new Date();
yesterdayDate.setDate(yesterdayDate.getDate() - 1);
const oneYearAgoFromYesterdayDate = new Date(yesterdayDate);
oneYearAgoFromYesterdayDate.setFullYear(oneYearAgoFromYesterdayDate.getFullYear() - 1);

export const yesterday = dateToString(yesterdayDate);
export const oneYearAgoFromYesterday = dateToString(oneYearAgoFromYesterdayDate);

