import { ILocation, GeoNameSearchOptions } from "../types";
import { kGeonamesUser, kGeonamesService, kDefaultMaxRows } from "../constants";


export const geoNameSearch = async (options: GeoNameSearchOptions): Promise<ILocation[] | undefined> => {
  const { searchString, maxRows = kDefaultMaxRows } = options;
  const url = new URL(kGeonamesService);
  url.searchParams.append("username", kGeonamesUser);
  url.searchParams.append("country", "US");
  url.searchParams.append("maxRows", maxRows.toString());
  url.searchParams.append("lang", "en");
  url.searchParams.append("type", "json");
  url.searchParams.append("isNameRequired", "true");
  url.searchParams.append("name_startsWith", searchString);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error("network error:" + response.statusText);
    }
    const data = await response.json();
    if (data.totalResultsCount > 0) {
      return data.geonames.map((place: any) => ({
        name: `${place.name}, ${place.adminCode1}`,
        latitude: place.lat,
        longitude: place.lng
      }));
    }
    return undefined;
  } catch (error) {
    console.error("Error fetching location data:", error);
    return undefined;
  }
};
