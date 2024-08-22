import React, { Component, createRef } from "react";
import $ from "jquery";
import "jquery-ui/ui/widgets/slider";

import "jquery-ui/themes/base/slider.css";
import "./slider.scss";

interface IProps {
  value: number;
  min: number;
  max: number;
  step: number;
  slide: (event: any, ui: any) => void;
  logId: string;
  log: ((action: string, data: any) => void) | null;
  start?: (event: any, ui: any) => void;
  stop?: (event: any, ui: any) => void;
  orientation?: "horizontal" | "vertical";
}
interface IOptions extends IProps {
  _slideStart: number;
  _prevValue: any;
}
export default class Slider extends Component<IProps> {
  static defaultProps = {
    logId: "",
    log: null
  };
  // props: any;
  containerRef = createRef<HTMLDivElement>();
  sliderFuncName: any;

  constructor(props: IProps) {
    super(props);
    // Default jQuery UI plugin.
    this.sliderFuncName = "slider";
  }

  get $slider() {
    return $(this.containerRef.current as HTMLDivElement) as any;
  }

  getSliderOpts(props: IProps) {
    const options = ({ ...props }) as IOptions;
    // Enhance options, support logging.
    if (props.log) {
      options.start = function (event: any, ui: any) {
        this._slideStart = Date.now();
        this._prevValue = ui.value;
        if (props.start) {
          props.start(event, ui);
        }
      };
      options.stop = function (event: any, ui: any) {
        const duration = (Date.now() - this._slideStart) / 1000;
        props.log?.(props.logId + "SliderChanged", {
          value: ui.value,
          prevValue: this._prevValue,
          duration
        });
        if (props.stop) {
          props.stop(event, ui);
        }
      };
    }
    return options;
  }

  componentDidMount() {
    this.$slider[this.sliderFuncName](this.getSliderOpts(this.props));
  }

  UNSAFE_componentWillReceiveProps(nextProps: any) {
    this.$slider[this.sliderFuncName](this.getSliderOpts(nextProps));
  }

  shouldComponentUpdate() {
    // Never update component as it's based on jQuery slider.
    return false;
  }

  render() {
    const { orientation } = this.props
    return (
      <div ref={this.containerRef} className="grasp-slider">
        {
          (orientation === "horizontal" || !orientation) &&
          <div className="ui-slider-tick" style={{ left: "50%", height: "100%" }}>
            <div className="ui-slider-tick-mark"></div>
          </div>
        }
        {
          orientation === "vertical" &&
          <div className="ui-slider-tick" style={{ bottom: "50%", width: "100%", height: 1 }}>
            <div className="ui-slider-tick-mark" style={{ width: "100%" }}></div>
          </div>
        }
      </div>
    );
  }
}
