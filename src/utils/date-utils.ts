const padNumber = (num: number): string => num.toString().padStart(2, "0");
const dateToString = (d: Date) => `${d.getFullYear()}-${padNumber(d.getMonth() + 1)}-${padNumber(d.getDate())}`

// default to end today
const defaultEndDate = new Date();

// default to start one year ago
const defaultStartDate = new Date(defaultEndDate);
defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 1);

export const defaultStart = dateToString(defaultEndDate);
export const defaultEnd = dateToString(defaultStartDate);

