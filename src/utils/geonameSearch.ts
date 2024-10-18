import { ILocation, GeoNameSearchOptions } from "../types";
import { kGeonamesUser, kGeonamesService, kDefaultMaxRows, kGeolocService } from "../constants";

const placeToLocation = (place: any): ILocation => {
  const admin = place.countryCode === "US" ? place.adminCode1 : place.countryName;
  const name = `${place.name}, ${admin}`;
  return {
    name,
    latitude: place.lat,
    longitude: place.lng
  };
};

export const geoNameSearch = async (options: GeoNameSearchOptions): Promise<ILocation[] | undefined> => {
  const { searchString, maxRows = kDefaultMaxRows } = options;
  const url = new URL(kGeonamesService);
  url.searchParams.append("username", kGeonamesUser);
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
      return data.geonames.map(placeToLocation);
    }
    return undefined;
  } catch (error) {
    console.error("Error fetching location data:", error);
    return undefined;
  }
};

export const findNearestLocation = async (lat: number, long: number): Promise<ILocation | undefined> => {
  const url = new URL(kGeolocService);
  url.searchParams.append("username", kGeonamesUser);
  url.searchParams.append("lat", String(lat));
  url.searchParams.append("lng", String(long));

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error("network error:" + response.statusText);
    }
    const data = await response.json();
    if (data.geonames?.length > 0) {
      return placeToLocation(data.geonames[0]);
    }
    return undefined;
  } catch (error) {
    console.error("Error fetching location data:", error);
    return undefined;
  }
};
