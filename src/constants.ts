export const kPluginName = "Day Length Plugin";
export const kVersion = "0.0.1";
export const kDataContextName = "DayLengthPluginData";
export const kInitialDimensions = {
  width: 380,
  height: 680
};

// These are only used in the simplified sunray angle calc
// solstice dates in season calc are based on astronomy-engine Seasons()
export const kBasicSummerSolstice = 172;
export const kEarthTilt = 23.5;

export const kGeonamesService = "https://secure.geonames.org/search";
export const kGeolocService = "https://secure.geonames.org/findNearbyPlaceNameJSON";
export const kGeonamesUser = "codap";
export const kDefaultMaxRows = 4;

export const kParentCollectionName = "Locations";
export const kChildCollectionName = "Daylight Info";

export const kParentCollectionAttributes = [
  {
    name: "latitude",
    type: "numeric"
  },
  {
    name: "longitude",
    type: "numeric"

  },
  {
    name: "location",
    type: "categorical"

  }
  // NOTE: If data are to be historical, add year attribute
];

export const kChildCollectionAttributes = [
  {
    name: "date",
    title: "Date",
    type: "date",
    hasToken: true
  },
  {
    name: "dayLength",
    title: "Day Length",
    type: "numeric",
    hasToken: true
  },
  {
    name: "sunrise",
    title: "Sunrise",
    type: "date",
    hasToken: true
  },
  {
    name: "sunset",
    title: "Sunset",
    type: "date",
    hasToken: true
  },
  {
    name: "dayNumber",
    title: "Day Number",
    type: "numeric",
    hasToken: false
  },
  {
    name: "sunlightAngle",
    title: "Sunlight Angle",
    type: "numeric",
    hasToken: true
  },
  {
    name: "solarIntensity",
    title: "Solar Intensity",
    type: "numeric",
    hasToken: true
  },
  {
    name: "season",
    title: "Season",
    type: "categorical",
    hasToken: true
  }
];

export const kDefaultOnAttributes = [
  "date", "sunrise", "sunset", "dayLength"
];
