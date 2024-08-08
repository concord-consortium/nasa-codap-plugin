import { useState } from "react";
import { kDataContextName, kChildCollectionName, kParentCollectionName, kParentCollectionAttributes, kChildCollectionAttributes } from "../constants";
import { DaylightCalcOptions, ILocation } from "../types";
import { getDayLightInfo } from "../utils/daylight-utils";
import {
  getAllItems,
  getAttribute,
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

  const handleClearData = async () => {
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

  const getDayLengthData = async (latitude: number, longitude: number, location: any) => {
    if (!latitude || !longitude) {
      alert("Please enter both latitude and longitude.");
      return;
    }

    let createDC;
    const calcOptions: DaylightCalcOptions = {
      latitude: Number(latitude),
      longitude: Number(longitude),
      year: 2024 // NOTE: If data are to be historical, add dynamic year attribute
    };

    const solarEvents = getDayLightInfo(calcOptions);
    const existingDataContext = await getDataContext(kDataContextName);

    if (!existingDataContext.success) {
      createDC = await createDataContext(kDataContextName);
      setDataContext(createDC.values);
    }

    if (existingDataContext?.success || createDC?.success) {
      await createParentCollection(
        kDataContextName,
        kParentCollectionName,
        kParentCollectionAttributes
      );
      await createChildCollection(
        kDataContextName,
        kChildCollectionName,
        kParentCollectionName,
        kChildCollectionAttributes
      );

      const completeSolarRecords = solarEvents.map(solarEvent => {
        const record: Record<string, any> = {
          latitude: Number(latitude),
          longitude: Number(longitude),
          location: location?.name,
          dayNumber: solarEvent.dayAsInteger,
          date: solarEvent.day,
          sunrise: solarEvent.sunrise,
          sunset: solarEvent.sunset,
          dayLength: solarEvent.dayLength,
          season: solarEvent.season,
          sunlightAngle: solarEvent.sunlightAngle,
          solarIntensity: solarEvent.solarIntensity
        };

        return record;
      });

      await createItems(kDataContextName, completeSolarRecords);
      return await createTable(kDataContextName);
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

  const extractUniqueLocations = (allItems: any): ILocation[] => {
    const uniqueLocations: ILocation[] = [];

    allItems.forEach((c: any) => {
      const locationObj: ILocation = {
        name: c.values.location,
        latitude: c.values.latitude,
        longitude: c.values.longitude,
        coordinatePair: `(${c.values.latitude},${c.values.longitude})`
      };

      if (!uniqueLocations.some((l) => l.coordinatePair === locationObj.coordinatePair)) {
        uniqueLocations.push(locationObj);
      }
    });

    return uniqueLocations;
  }


  const getUniqueLocationsInCodapData = async () => {
    const locationAttr = await getAttribute(kDataContextName, kParentCollectionName, "location");
    if (locationAttr.success){
      const allItems = await getAllItems(kDataContextName);
      if (allItems.success){
        const uniqeLocations: ILocation[] = extractUniqueLocations(allItems.values);
        return uniqeLocations;
      }
    }
  };

  return {
    dataContext,
    updateAttributeVisibility,
    handleClearData,
    getDayLengthData,
    getUniqueLocationsInCodapData,
    extractUniqueLocations
  };
};
