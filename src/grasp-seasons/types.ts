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
  // -- Day Length Plugin extra state ---
  // It could be ported back to GRASP Seasons too to handle camera model cleaner way.
  showCamera: boolean;
  // A new type of view where the camera is locked on Earth. It is different from GRASP Seasons Earth View because the
  // camera follows Earth's position but does not rotate. As the year passes, we'll see different parts of Earth,
  // including its night side. This is useful for keeping the Earth's axis constant.
  earthCloseUpView: boolean;
  cameraTiltAngle: number;
}

export type ModelType = "earth-view" | "orbit-view" | "unknown";

export interface IModelParams {
  type: ModelType;
}
