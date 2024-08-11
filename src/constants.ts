export const kPluginName = "Day Length Plugin";
export const kVersion = "0.0.1";
export const kDataContextName = "DayLengthPluginData";
export const kInitialDimensions = {
  width: 380,
  height: 680
};
export const kSimulationTabDimensions = {
  width: 690,
  height: 630
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

// This is configurable because still have some development and iteration
// to do in terms of best fit for v3 and v2 use cases for this plugin.
export const kDateWithTimeFormats = {

  // (UTC) Do not use unless CODAP or plugin has mechanism to translate to a given TZ
  // 1982-01-23T10:45Z
  asZuluISO: "YYYY-MM-DDTHH:mm[Z]",

  // Use if both v2 and v3 will display clock time as expected, be okay with offset as programmatic asset
  // 1982-01-23T10:45-07:00 (example offset -07:00)
  asLocalISOWithTZOffset: "YYYY-MM-DDTHH:mmZ", // currently using this

  // Use if truly no offset is included/needed, local time only
  // 1982-01-23T10:45
  asLocalISO: "YYYY-MM-DDTHH:mm",

  // use if we must display time as a string AND we have a CODAP way to treat As if needed to graph etc.
  // 10:45
  asClockTimeString: "HH:mm",
}

export const kDateFormats = {

  // Use if we need the real ISO date with year for graphing, etc.
  // 1982-01-23
  asLocalISODate: "YYYY-MM-DD", // currently using this

  // Use if we must display date as a string AND we have a CODAP way to treat As if needed to graph etc.
  // 01-23
  asCalendarDateString: "MM-DD",
}
