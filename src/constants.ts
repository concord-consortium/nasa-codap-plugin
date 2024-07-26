export const kPluginName = "Day Length Plugin";
export const kVersion = "0.0.1";
export const kDataContextName = "DayLengthPluginData";
export const kInitialDimensions = {
  width: 380,
  height: 680
};

export const kGeonamesService = "https://secure.geonames.org/search";
export const kGeolocService = "https://secure.geonames.org/findNearbyPlaceNameJSON";
export const kGeonamesUser = "codap";
export const kDefaultMaxRows = 4;

export const kParentCollectionName = "Locations";
export const kChildCollectionName = "Daylight Info";

export const kParentCollectionAttributes = [
  { name: "latitude", type: "numeric" },
  { name: "longitude", type: "numeric" },
  { name: "location", type: "categorical" }
];

export const kChildCollectionAttributes = [
  { name: "day", type: "date" },
  { name: "sunrise", type: "date" },
  { name: "sunset", type: "date" },
  { name: "dayLength", type: "numeric" },
  { name: "dayAsInteger", type: "numeric" }
];

export const kSelectableAttributes = [
  { string: "Day", attrName: "day" },
  { string: "Rise hour", attrName: "sunrise" },
  { string: "Set hour", attrName: "sunset" },
  { string: "Day Length", attrName: "dayLength" },
];
