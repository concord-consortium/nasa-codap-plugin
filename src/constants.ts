import { IAttribute } from "./types";

export const kPluginName = "NASA: Earth, Air, and Water";
export const kVersion = "0.0.1";
export const kDataContextName = "NASAPluginData";
export const kInitialDimensions = {
  width: 360,
  height: 541
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
export const kChildCollectionName = "NASA Info";

export const kAdjustSpringForwardOutlier = false;

export const kParentCollectionAttributes = [
  {
    name: "Latitude",
    type: "numeric",
    unit: "°"
  },
  {
    name: "Longitude",
    type: "numeric",
    unit: "°"
  },
  {
    name: "Location",
    type: "categorical"
  }
];

export const kChildCollectionAttributes: IAttribute[] = [
  {
    name: "Date",
    title: "Date",
    type: "date",
    precision: "day",
  },
  {
    name: "Month",
    title: "Month",
    type: "categorical",
    formula: "monthName(Date)"
  },
  {
    name: "Year",
    title: "Year",
    type: "categorical",
    formula: "year(Date)",
  },
  {
    name: "Season",
    title: "Season",
    type: "categorical",
    description: "Seasons are determined by the dates of the spring and fall equinoxes and the summer and winter solstices."
  },
  {
    name: "Elevation",
    title: "Elevation",
    type: "numeric",
    unit: "meter"
  },
  // -- Sunlight Category --
  {
    name: "Length of day",
    title: "Length of day",
    type: "numeric",
    unit: "hours",
    description: "Number of hours of sunlight in decimal time.",
    category: "Sunlight"
  },
  {
    name: "rawSunrise",
    title: "rawSunrise",
    type: "date",
    hidden: true,
    precision: "seconds",
    description: "Sunrise as date object.",
    category: "Sunlight"
  },
  {
    name: "rawSunset",
    title: "rawSunset",
    type: "date",
    hidden: true,
    precision: "seconds",
    description: "Sunset as date object.",
    category: "Sunlight"
  },
  {
    name: "Sunrise",
    title: "Sunrise",
    type: "numeric",
    unit: "decimal hours",
    formula: "hours(rawSunrise)+minutes(rawSunrise)/60",
    description: "The local time of sunrise in decimal time.",
    category: "Sunlight"
  },
  {
    name: "Sunset",
    title: "Sunset",
    type: "numeric",
    unit: "decimal hours",
    formula: "hours(rawSunset)+minutes(rawSunset)/60",
    description: "The local time of sunset in decimal time.",
    category: "Sunlight"
  },
  {
    name: "Sunlight angle",
    title: "Sunlight angle",
    type: "numeric",
    unit: "°",
    description: "Angle at which sunlight hits the earth at noon each day (degrees).",
    category: "Sunlight"
  },
  {
    name: "UV Index",
    title: "UV Index",
    type: "numeric",
    unit: "",
    description: "The ultraviolet radiation exposure index (UV Index) is a scale that measures the amount of UV radiation reaching the Earth's surface. It provides a daily forecast of the expected risk of overexposure to the sun.",
    NASAParamName: "ALLSKY_SFC_UV_INDEX",
    category: "Sunlight"
  },
  {
    name: "Solar intensity",
    title: "Solar intensity",
    type: "numeric",
    unit: "W/㎡",
    description: "An estimate of the amount of energy from the Sun traveling downward toward the surface of the Earth at noon each day.",
    NASAParamName: "CLRSKY_SFC_SW_DWN",
    category: "Sunlight"
  },
  // -- Temperature Category --
  {
    name: "Max air temperature",
    title: "Max air temperature",
    type: "numeric",
    unit: "°C",
    description: "Daily maximum air temperature at 2 meters above the surface of the earth.",
    NASAParamName: "T2M_MAX",
    category: "Temperature"
  },
  {
    name: "Max surface temperature",
    title: "Max surface temperature",
    type: "numeric",
    unit: "°C",
    description: "The daily maximum temperature at the Earth’s surface for a specific location. Also known as Earth’s “skin temperature.”",
    NASAParamName: "TS_MAX",
    category: "Temperature"
  },
  // -- Water Availability Category --
  {
    name: "Precipitation",
    title: "Precipitation",
    type: "numeric",
    unit: "mm/day",
    description: "Total precipitation reaching Earth’s surface for the day (includes snow).",
    NASAParamName: "PRECTOTCORR",
    category: "Water Availability"
  },
  {
    name: "Daytime clouds",
    title: "Daytime clouds",
    type: "numeric",
    unit: "%",
    description: "The average percentage of cloud cover over the course of the day (during daylight).",
    NASAParamName: "CLOUD_AMT_DAY",
    category: "Water Availability"
  },
  {
    name: "Soil moisture",
    title: "Soil moisture",
    type: "numeric",
    unit: "",
    description: "Amount of soil moisture from 0% water free to 100% saturated.",
    NASAParamName: "GWETPROF",
    category: "Water Availability"
  }
];

export const kUsedNASAParams = kChildCollectionAttributes.filter(attr => attr.NASAParamName) as (IAttribute & { NASAParamName: string })[];

export const kDefaultOnAttributes = [
  "date", "Length of day"
];

export const kDateWithTimeFormats = {
  asZuluISO: "YYYY-MM-DDTHH:mm[Z]",              // 1999-01-23T21:45Z
  asLocalISOWithTZOffset: "YYYY-MM-DDTHH:mmZ",   // 1999-01-23T14:45-07:00
  asClockTimeString: "HH:mm",                    // 14:45
  asClockTimeStringAMPM: "h:mm a",               // 2:45 PM
}

export const kDateFormats = {
  asLocalISODate: "YYYY-MM-DD",
}
