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
  lang: Language;
}

export type ViewType = "earth" | "orbit" | "raysGround" | "raysSpace" | "nothing";

export interface IViewState {
  main: ViewType;
  "small-top": ViewType;
  "small-bottom": ViewType;
}

export type ModelType = "earth-view" | "orbit-view" | "unknown";

export interface IModelParams {
  type: ModelType;
}
