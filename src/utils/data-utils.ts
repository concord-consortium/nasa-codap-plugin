import { kDataContextName, kChildCollectionName, kParentCollectionName } from "../constants";
import { DaylightCalcOptions } from "../types";
import { getDayLightInfo } from "./daylight-utils";
import {
  getDataContext,
  codapInterface,
  createItems,
  createTable,
  createDataContext,
  createParentCollection,
  createChildCollection
} from "@concord-consortium/codap-plugin-api";

export const handleClearData = async () => {
  let result = await getDataContext(kDataContextName);
  if (result.success) {
    let dc = result.values;
    let lastCollection = dc.collections[dc.collections.length - 1];
    return await codapInterface.sendRequest({
      action: "delete",
      resource: `dataContext[${kDataContextName}].collection[${lastCollection.name}].allCases`
    });
  } else {
    return Promise.resolve({ success: true });
  }
};

export const getDayLengthData = async (latitude: number, longitude: number, location: any, selectedAttrs: string[]) => {
  if (!latitude || !longitude) {
    alert("Please enter both latitude and longitude.");
    return;
  }

  let createDC;
  const calcOptions: DaylightCalcOptions = {
    latitude: Number(latitude),
    longitude: Number(longitude),
    year: 2024,
    useRealTimeZones: true
  };

  const solarEvents = getDayLightInfo(calcOptions);
  const existingDataContext = await getDataContext(kDataContextName);

  if (!existingDataContext.success) {
    // There are other plugins that populate a local react state with data context
    // when this function was in a react component, I did that here
    // Not finding a time I needed it (yet) I am leaving it out here
    // If I do need it, it's possible this function would need to be moved to a hook
    // TODO maybe just move it to a hook anyway
    createDC = await createDataContext(kDataContextName);
  }

  if (existingDataContext?.success || createDC?.success) {
    await createParentCollection(kDataContextName, kParentCollectionName, [
      { name: "latitude", type: "numeric" },
      { name: "longitude", type: "numeric" },
      { name: "location", type: "categorical" }
    ]);
    await createChildCollection(kDataContextName, kChildCollectionName, kParentCollectionName, [
      { name: "day", type: "date" },
      { name: "sunrise", type: "date" },
      { name: "sunset", type: "date" },
      { name: "dayLength", type: "numeric" },
      { name: "dayAsInteger", type: "numeric" }
    ]);

    const completeSolarRecords = solarEvents.map(solarEvent => {
      const record: Record<string, any> = {
        latitude: Number(latitude),
        longitude: Number(longitude),
        location: location?.name,
        dayAsInteger: solarEvent.dayAsInteger
      };

      if (selectedAttrs.includes("day")) {
        record.day = solarEvent.day;
      }
      if (selectedAttrs.includes("sunrise")) {
        record.sunrise = solarEvent.sunrise;
      }
      if (selectedAttrs.includes("sunset")) {
        record.sunset = solarEvent.sunset;
      }
      if (selectedAttrs.includes("dayLength")) {
        record.dayLength = solarEvent.dayLength;
      }

      return record;
    });

    await createItems(kDataContextName, completeSolarRecords);
    await createTable(kDataContextName);
  }
};
