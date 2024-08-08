import * as THREE from "three";
import CanvasView, { ICanvasProps } from "./canvas-view";
import OrbitView from "../3d-views/orbit-view";
import { ISimState } from "../types";

interface IProps extends ICanvasProps {
  showCamera: boolean;
}
export default class OrbitViewComp extends CanvasView<IProps> {
  _startAngle?: number;
  constructor(props: IProps) {
    super(props);
    this.ExternalView = OrbitView;
  }

  componentDidMount() {
    super.componentDidMount();
    this.externalView.on("props.change", (newProps: Partial<ISimState>) => {
      this.props.onSimStateChange(newProps);
    });
    this._setupLogging();
  }

  setViewAxis(vec: THREE.Vector3) {
    this.externalView.setViewAxis(vec);
  }

  toggleCameraModel(show: boolean) {
    this.externalView.toggleCameraModel(show);
  }

  getEarthPosition() {
    return this.externalView.getEarthPosition();
  }

  lockCameraRotation(lock: boolean) {
    this.externalView.lockCameraRotation(lock);
  }

  _setupLogging() {
    this.externalView.on("camera.changeStart", () => {
      this._startAngle = this.externalView.getCameraTiltAngle();
    });
    this.externalView.on("camera.changeEnd", () => {
      this.props.log?.("OrbitViewAngleChanged", {
        value: this.externalView.getCameraTiltAngle(),
        prevValue: this._startAngle
      });
    });
  }
}
