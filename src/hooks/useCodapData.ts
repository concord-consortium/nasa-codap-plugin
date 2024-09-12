import { useCallback, useState } from "react";
import { kDataContextName, kChildCollectionName, kParentCollectionName, kParentCollectionAttributes, kChildCollectionAttributes } from "../constants";
import { DaylightCalcOptions, ILocation } from "../types";
import { getDayLightInfo, locationsEqual } from "../utils/daylight-utils";
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
import { fetchNASAData, getNASAAttributeValues } from "../utils/nasa-api";

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

  const getDayLengthAndNASAData = async (location: ILocation, startDate: string, endDate: string, selectedAttributes: string[]) => {
    // Execute NASA API request first, as it might fail.
    const NASAData = await fetchNASAData(location.latitude, location.longitude, startDate, endDate);
     // NASA API returns elevation as the third element of the coordinates array, so we can use it directly
    const elevation = NASAData.geometry.coordinates[2];

    const calcOptions: DaylightCalcOptions = {
      latitude: location.latitude,
      longitude: location.longitude,
      startDate,
      endDate
    };
    const solarEvents = getDayLightInfo(calcOptions);
    const existingDataContext = await getDataContext(kDataContextName);

    let newDataContext;
    if (!existingDataContext.success) {
      newDataContext = await createDataContext(kDataContextName);
    }

    if (existingDataContext?.success || newDataContext?.success) {
      await createParentCollection(
        kDataContextName,
        kParentCollectionName,
        kParentCollectionAttributes
      );
      const childCollectionAttributesWithVisibility = kChildCollectionAttributes.map(attr => ({
        ...attr,
        // hidden: selectedAttributes.includes(attr.name)
      }));
      await createChildCollection(
        kDataContextName,
        kChildCollectionName,
        kParentCollectionName,
        childCollectionAttributesWithVisibility
      );

      const completeSolarRecords = solarEvents.map(solarEvent => ({
        Latitude: location.latitude,
        Longitude: location.longitude,
        Location: location.name,
        Date: solarEvent.day,
        Season: solarEvent.season,
        Elevation: elevation,
        rawSunrise: solarEvent.rawSunrise,
        rawSunset: solarEvent.rawSunset,
        "Length of day": solarEvent.dayLength,
        "Sunlight angle": solarEvent.sunlightAngle,
        ...getNASAAttributeValues(NASAData, solarEvent.day)
      }));

      await createItems(kDataContextName, completeSolarRecords);
      setDataContext(existingDataContext.success ? existingDataContext.values : newDataContext?.values);
      return await createTable(kDataContextName);
    }
  };

  const updateAttributeVisibility = useCallback((attributeName: string, hidden: boolean) => {
    try {
      updateAttribute(
        kDataContextName,
        kChildCollectionName,
        attributeName,
        { name: attributeName },
        { hidden }
      );
    } catch (error) {
      console.error("Error updating attribute visibility:", error);
    }
  }, []);

  const extractUniqueLocations = (allItems: any): ILocation[] => {
    const uniqueLocations: ILocation[] = [];

    allItems.forEach((c: any) => {
      const locationObj: ILocation = {
        name: c.values.location,
        latitude: c.values.latitude,
        longitude: c.values.longitude,
      };

      if (!uniqueLocations.some((l) => locationsEqual(l, locationObj))) {
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
    setDataContext,
    updateAttributeVisibility,
    handleClearData,
    getDayLengthAndNASAData,
    getUniqueLocationsInCodapData,
    extractUniqueLocations
  };
};
