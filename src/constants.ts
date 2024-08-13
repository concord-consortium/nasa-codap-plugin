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
];

export const kChildCollectionAttributes = [
  {
    name: "date",
    title: "Date",
    type: "date",
    hasToken: true,
    precision: "day"
  },
  {
    name: "monthDay",
    title: "Day of Month",
    type: "categorical",
    hasToken: true,
    formula: "monthName(date) + ' ' + dayOfMonth(date)"
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
    type: "categorical",
    hasToken: true
  },
  {
    name: "sunset",
    title: "Sunset",
    type: "categorical",
    hasToken: true
  },
  {
    name: "dayNumber",
    title: "Day Number",
    type: "numeric",
    hasToken: true
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
  },
  {
    name: "sunriseMinSinceMidnight",
    title: "Sunrise Minutes Since Midnight",
    type: "numeric",
    hasToken: true
  },
  {
    name: "sunsetMinSinceMidnight",
    title: "Sunset Minutes Since Midnight",
    type: "numeric",
    hasToken: true
  }
];

export const kDefaultOnAttributes = [
  "date", "sunrise", "sunset", "dayLength", "season", "sunlightAngle", "solarIntensity", "sunriseMinSinceMidnight", "sunsetMinSinceMidnight", "dayNumber"
];

export const kDateWithTimeFormats = {
  asZuluISO: "YYYY-MM-DDTHH:mm[Z]",              // 1999-01-23T21:45Z
  asLocalISOWithTZOffset: "YYYY-MM-DDTHH:mmZ",   // 1999-01-23T14:45-07:00
  asClockTimeString: "HH:mm",                    // 14:45
  asClockTimeStringAMPM: "h:mm a",               // 2:45 PM
}

export const kDateFormats = {
  asLocalISODate: "YYYY-MM-DD",
  asCalendarDateString: "MM-DD",
}
