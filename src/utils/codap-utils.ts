import { kDataContextName, kChildCollectionName, kParentCollectionName, kParentCollectionAttributes, kChildCollectionAttributes } from "../constants";
import { AttributeCategory, DaylightCalcOptions, IAttribute, ILocation, Units } from "../types";
import { getDayLightInfo, locationsEqual } from "./daylight-utils";
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
import { fetchNASAData, getNASAAttributeValues } from "./nasa-api";

export const clearData = async () => {
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

export const isDataComplete = (codapCases: Record<string, any>[], attributeNames: string[]) => {
  return codapCases.every(c => attributeNames.every(attr => c[attr] !== undefined));
};

export const getDayLengthAndNASAData = async (location: ILocation, startDate: string, endDate: string, selectedAttrCategories: AttributeCategory[], units: Units) => {
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
    await createParentCollection(
      kDataContextName,
      kParentCollectionName,
      attrsToCodapAttrs(kParentCollectionAttributes, units)
    );
    const childCollectionAttributesWithVisibility = kChildCollectionAttributes.map(attr => ({
      ...attr,
      hidden: attr.hidden !== undefined ? attr.hidden : (attr.category && !selectedAttrCategories.includes(attr.category))
    }));
    await createChildCollection(
      kDataContextName,
      kChildCollectionName,
      kParentCollectionName,
      attrsToCodapAttrs(childCollectionAttributesWithVisibility, units)
    );
    await createTable(kDataContextName);
  }

  if (existingDataContext.success || newDataContext?.success) {
    const codapCasesMetric = solarEvents.map(solarEvent => ({
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

    const codapCasesImperial = codapCasesMetric.map((c: Record<string, string | number>) => {
      const cImperial = { ...c };
      [...kParentCollectionAttributes, ...kChildCollectionAttributes].forEach(attr => {
        if (c[attr.name] !== undefined && attr.unit?.metricToImperial) {
          cImperial[attr.name] = attr.unit.metricToImperial(c[attr.name] as number);
        }
      });
      return cImperial;
    });

    const codapCases = units === "imperial" ? codapCasesImperial : codapCasesMetric
    await createItems(kDataContextName, codapCases);

    // Attributes with formulas will not have any values defined in the case list.
    const requiredAttrNames = kChildCollectionAttributes.filter(a => !a.formula).map(a => a.name);
    const dataComplete = isDataComplete(codapCases, requiredAttrNames);

    return { codapCasesMetric, codapCasesImperial, dataComplete };
  }
  throw new Error("Failed to create data context");
};

export const updateAttributeVisibility = (attributeName: string, hidden: boolean) => {
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
};

export const updateAttributeUnits = (units: Units) => {
  try {
    [kParentCollectionAttributes, kChildCollectionAttributes].forEach((attrs, collectionIdx) => {
      attrs.forEach(attr => {
        if (attr.unit && attr.unit.metric !== attr.unit.imperial) {
          updateAttribute(
            kDataContextName,
            collectionIdx === 0 ? kParentCollectionName : kChildCollectionName,
            attr.name,
            { name: attr.name },
            { unit: units === "metric" ? attr.unit?.metric : attr.unit?.imperial }
          );
        }
      });
    });
  } catch (error) {
    console.error("Error updating attribute unit:", error);
  }
};

export const extractUniqueLocations = (allItems: any): ILocation[] => {
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
};

export const getUniqueLocationsInCodapData = async () => {
  const locationAttr = await getAttribute(kDataContextName, kParentCollectionName, "location");
  if (locationAttr.success) {
    const allItems = await getAllItems(kDataContextName);
    if (allItems.success) {
      const uniqeLocations: ILocation[] = extractUniqueLocations(allItems.values);
      return uniqeLocations;
    }
  }
};

export const attrsToCodapAttrs = (attrs: IAttribute[], units: Units) =>
  attrs.map(attr => ({ ...attr, unit: units === "metric" ? attr.unit?.metric : attr.unit?.imperial }));
