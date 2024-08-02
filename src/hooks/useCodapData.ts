import { useState } from "react";
import { kDataContextName, kChildCollectionName, kParentCollectionName } from "../constants";
import { DaylightCalcOptions } from "../types";
import { getDayLightInfo } from "../utils/daylight-utils";
import {
  getDataContext,
  codapInterface,
  createItems,
  createTable,
  createDataContext,
  createParentCollection,
  createChildCollection,
  updateAttribute
} from "@concord-consortium/codap-plugin-api";

export const useCodapData = () => {
  const [dataContext, setDataContext] = useState<any>(null);

  const handleClearDataClick = async () => {
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

  const getDayLengthData = async (latitude: number, longitude: number, location: any, selectedAttrs: string[]) => {
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
      createDC = await createDataContext(kDataContextName);
      setDataContext(createDC.values);
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
          dayAsInteger: solarEvent.dayAsInteger,
          day: solarEvent.day,
          sunrise: solarEvent.sunrise,
          sunset: solarEvent.sunset,
          dayLength: solarEvent.dayLength
        };

        return record;
      });

      await createItems(kDataContextName, completeSolarRecords);
      await createTable(kDataContextName);
    }
  };

  const updateAttributeVisibility = async (attributeName: string, hidden: boolean) => {
    if (!dataContext) return;

    try {
      await updateAttribute(
        kDataContextName,
        kChildCollectionName,
        attributeName,
        { name: attributeName },
        { hidden }
      );
    } catch (error) {
      console.error("Error updating attribute visibility:", error);
    }
  };

  return {
    dataContext,
    updateAttributeVisibility,
    handleClearDataClick,
    getDayLengthData
  };
};
