import { kUsedNASAParams } from "../constants";

const baseURL = "https://power.larc.nasa.gov/api/temporal/daily/point";

const config = {
  // Community parameter affects the units of the data.
  // ag=Agroclimatology
  // sb=Sustainable Buildings
  // re=Renewable Energy
  // sb seems to be the most useful for our case, as it sets the units of CLRSKY_SFC_SW_DWN to W/m^2 that was requested by PIs.
  // You can check the units for each community value in the API documentation: https://power.larc.nasa.gov/
  // (go to Resources and look for your parameter)
  community: "sb",
  parameters: kUsedNASAParams.map(attr => attr.NASAParamName).join(","),
  format: "json",
  "time-standard": "lst"
}

// NASA API returns -999 for missing values.
const NASA_API_NULL_VALUE = -999;

export const dateToAPIDateFormat = (date: string | Date) => {
  if (typeof date === "string") {
    date = new Date(date);
  }
  return date.toISOString().split("T")[0].replace(/-/g, "");
};

export async function fetchNASAData(latitude: number, longitude: number, startDate: string, endDate: string) {
  const queryParams = new URLSearchParams({
    ...config,
    start: dateToAPIDateFormat(startDate),
    end: dateToAPIDateFormat(endDate),
    latitude: latitude.toString(),
    longitude: longitude.toString(),
  });

  const url = `${baseURL}?${queryParams.toString()}`;

  const response = await fetch(url);
  const json = await response.json();
  if (!response.ok) {
    console.error("NASA POWER API Error:", response.statusText, json, json.messages.join(", "));
    throw new Error(json.messages[0]);
  }

  return json;
}

export function getNASAAttributeValues(NASAResponse: any, day: string): Record<string, number> {
  const { parameter: values } = NASAResponse.properties;
  const formattedDate = dateToAPIDateFormat(day);

  return kUsedNASAParams.reduce((result: Record<string, number>, attr) => {
    const value = values[attr.NASAParamName]?.[formattedDate];
    if (value !== undefined && value !== NASA_API_NULL_VALUE) {
      result[attr.name] = value;
    }
    return result;
  }, {});
}
