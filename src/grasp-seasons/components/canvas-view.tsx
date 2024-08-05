import React, { Component, createRef } from "react";
import { ISimState } from "../types";

export interface ICanvasProps {
  simulation: ISimState;
  log?: (action: string, data: any) => void;
  onSimStateChange: (newProps: Partial<ISimState>) => void;
}
export default class CanvasView<TProps extends ICanvasProps> extends Component<TProps> {
  ExternalView: any;  // EarthView | GroundRaysView | OrbitView | SpaceRaysView
  externalView: any;  // instance of above class
  refs: any;
  containerRef = createRef<HTMLDivElement>();

  componentDidMount() {
    this.externalView = new this.ExternalView(this.containerRef.current, this.props.simulation);
    if (this.externalView.on) {
      this.externalView.on("log", (action: string, data: any) => {
        this.props.log?.(action, data);
      });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: TProps) {
    this.externalView.setProps(nextProps.simulation);
  }

  shouldComponentUpdate() {
    // Never update component as it's based on canvas.
    return false;
  }

  // requestAnimationFrame callback.
  rafCallback(timestamp: number) {
    this.externalView.render?.(timestamp);
  }

  resize() {
    this.externalView.resize?.();
  }

  render() {
    return (
      <div ref={this.containerRef} style={{ width: "100%", height: "100%" }}>
        { /* Canvas will be inserted here by the external view. */ }
      </div>
    );
  }
}
