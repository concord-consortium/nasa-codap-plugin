import CanvasView, { ICanvasProps } from "./canvas-view";
import EarthView from "../3d-views/earth-view";
import { ISimState } from "../types";

interface IProps extends ICanvasProps {
  onCameraChange: () => void;
}
export default class EarthViewComp extends CanvasView<IProps> {
  constructor(props: IProps) {
    super(props);
    this.ExternalView = EarthView;
  }

  componentDidMount() {
    super.componentDidMount();
    this.externalView.on("props.change", (newProps: Partial<ISimState>) => {
      this.props.onSimStateChange(newProps);
    });
    this.externalView.on("camera.change", () => {
      this.props.onCameraChange();
    });
  }
  toggleGridlines(gridlines: boolean){
    this.externalView.toggleGridlines(gridlines);
  }

  getCameraEarthVec() {
    return this.externalView.getCameraEarthVec();
  }

  lookAtSubsolarPoint() {
    this.externalView.lookAtSubsolarPoint();
  }

  lookAtLatLongMarker() {
    this.externalView.lookAtLatLongMarker();
  }
}
