import { Language } from "./translation/translate";

export interface ISimState {
  day: number;
  earthTilt: boolean;
  earthRotation: number;
  sunEarthLine: boolean;
  lat: number;
  long: number;
  sunrayColor: string;
  groundColor: string;
  sunrayDistMarker: boolean;
  dailyRotation: boolean;
  earthGridlines: boolean;
  showCamera: boolean;
  lang: Language;
}

export type ModelType = "earth-view" | "orbit-view" | "unknown";

export interface IModelParams {
  type: ModelType;
}
