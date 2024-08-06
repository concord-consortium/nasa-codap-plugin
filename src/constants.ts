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
    type: "date"
  },
  {
    name: "sunrise",
    title: "Sunrise",
    type: "date"
  },
  {
    name: "sunset",
    title: "Sunset",
    type: "date"
  },
  {
    name: "dayLength",
    title: "Day Length",
    type: "numeric"
  },
  {
    name: "dayNumber",
    title: "Day Number",
    type: "numeric"
  },
  {
    name: "sunlightAngle",
    title: "Sunlight Angle",
    type: "numeric"
  },
  {
    name: "season",
    title: "Season",
    type: "categorical"
  },
  {
    name: "solarIntensity",
    title: "Solar Intensity",
    type: "numeric"
  },
  {
    name: "clearskyIrradiance",
    title: "Clear Sky Solar Irradiance",
    type: "numeric"
  }
];

export const kDefaultOnAttributes = [
  "date", "sunrise", "sunset", "dayLength"
];
