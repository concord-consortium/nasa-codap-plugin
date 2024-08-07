import $ from "jquery";
import { colorInterpolation } from "../utils/utils";
import { kEarthTilt } from "../../constants";
import { getSunrayAngleInDegrees } from "../../utils/daylight-utils";

const DEG_2_RAD = Math.PI / 180;

const SKY_COLOR = "#99ADF1";
const DIST_MARKER_COLOR = "#87C2E8";

const GROUND_FRACTION = 0.2;
const DIST_MARKER_HEIGHT_FRACTION = 0.1;
const NUM_BEAMS = 10;

const MAX_DAY = 364;
// Color palette for ground.
// Keys defines time of year normalized to [0, 1] range. So, Jan 1st is 0, Dec 31st is 1.
const GROUND_COLORS: Record<number, [number, number, number]> = {
  0.20: [151, 169, 177], // light blue, winter
  0.23: [118, 199, 68], // light green, spring
  0.60: [72, 140, 42], // green, summer
  0.70: [100, 132, 0], /// dark green, summer
  0.73: [147, 112, 22], // brown, autumn
  0.96: [125, 74, 5], // brown, autumn
  0.98: [116, 136, 144] // dark blue, winter
};

const DEFAULT_PROPS = {
  day: 0,
  lat: 0,
  earthTilt: true,
  sunrayColor: "#D8D8AC",
  groundColor: "auto", // different for each season
  sunrayDistMarker: false
};

export default class {
  canvas: any;
  ctx: any;
  groundColorFunc: any;
  height: any;
  props: any;
  width: any;
  constructor(parentEl: any, props = DEFAULT_PROPS) {
    this.canvas = document.createElement("canvas");
    parentEl.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.groundColorFunc = colorInterpolation(GROUND_COLORS);

    this.props = {};
    this.setProps(props);

    this.resize();
  }

  setProps(newProps: any) {
    const oldProps = $.extend(this.props);
    this.props = $.extend(this.props, newProps);

    if (this.props.day !== oldProps.day ||
      this.props.earthTilt !== oldProps.earthTilt ||
      this.props.lat !== oldProps.lat ||
      this.props.sunrayColor !== oldProps.sunrayColor ||
      this.props.groundColor !== oldProps.groundColor ||
      this.props.sunrayDistMarker !== oldProps.sunrayDistMarker) {
      this.render();
    }
  }

  render() {
    this.drawSky(SKY_COLOR);
    this.drawGround(0, GROUND_FRACTION);
    this.drawPolarNightOverlay();
    this.drawRays();
    this.drawDistanceBetweenRays();
  }

  get solarAngle() {
    return getSunrayAngleInDegrees(this.props.day, this.props.earthTilt ? kEarthTilt : 0, this.props.lat) * DEG_2_RAD;
  }

  get polarNight() {
    const solarAngle = this.solarAngle;
    return solarAngle < 0 || solarAngle > 180 * DEG_2_RAD;
  }

  drawRays() {
    const solarAngle = this.solarAngle;
    if (solarAngle < 0 || solarAngle > 180 * DEG_2_RAD) return;

    const width = this.width;
    const height = this.height;
    const groundHeight = GROUND_FRACTION * height;
    const skyHeight = height - groundHeight;

    // Longest possible line.
    const maxLength = Math.sqrt(skyHeight * skyHeight + width * width);
    let x: any;
    const dx = raysXDiff(solarAngle, width);
    const lineRotationRadians = 90 * DEG_2_RAD - solarAngle;

    this.ctx.save();
    this.ctx.strokeStyle = this.props.sunrayColor;
    this.ctx.fillStyle = this.props.sunrayColor;

    // Could be +/- Infinity when solarAngle is 0
    if (isFinite(dx)) {
      let idx = 0;
      for (x = dx / 2; x < width; x += dx, idx += 1) {
        this.ctx.save();
        this.ctx.translate(x, skyHeight);
        this.drawLine(lineRotationRadians, 5, maxLength);
        this.drawArrow(lineRotationRadians, 0.7, 0.7);
        this.ctx.restore();
      }
    }

    const dy = Math.abs(width / (NUM_BEAMS + 1) / Math.cos(solarAngle));
    const yInitial = solarAngle < 90 * DEG_2_RAD ? (dy / 2) : (((x - width) / dx) * dy);
    const xEdge = solarAngle < 90 * DEG_2_RAD ? 0 : width;
    if (isFinite(dy)) {
      for (let y = skyHeight - yInitial; y > 0; y -= dy) {
        this.ctx.save();
        this.ctx.translate(xEdge, y);
        this.drawLine(lineRotationRadians, 0, maxLength);
        this.ctx.restore();
      }
    }
    this.ctx.restore();
  }

  drawDistanceBetweenRays() {
    if (this.props.sunrayDistMarker && !this.polarNight) {
      const dx = raysXDiff(this.solarAngle, this.width);
      this.drawRaysDistMarker(dx * 0.5, this.height * (1 - GROUND_FRACTION), dx);
    }
  }

  // Resize canvas to fill its parent.
  resize() {
    const $parent = $(this.canvas).parent();
    this.width = $parent.width();
    this.height = $parent.height();
    // Update canvas attributes (they can be undefined if canvas size is set using CSS).
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.render();
  }

  drawSky(color: any) {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.restore();
  }

  drawGround(angle: any, groundFraction: any) {
    this.ctx.save();
    this.ctx.translate(this.width * 0.5,  this.height * (1 - groundFraction));
    this.ctx.rotate(angle);
    this.ctx.fillStyle = this.props.groundColor === "auto" ?
      this.groundColorFunc(this.props.day / MAX_DAY) : this.props.groundColor;
    this.ctx.fillRect(-this.width, 0, this.width * 2, this.height);
    this.ctx.restore();
  }

  drawPolarNightOverlay() {
    if (this.solarAngle < 0 || this.solarAngle > 180 * DEG_2_RAD) {
      this.ctx.save();
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.restore();
    }
  }

  drawLine(angle: any, lengthAdjustment: any, length: any) {
    this.ctx.save();
    this.ctx.lineWidth = 2;
    this.ctx.rotate(angle);
    this.ctx.beginPath();
    this.ctx.moveTo(0, -lengthAdjustment);
    this.ctx.lineTo(0, -length);
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawArrow(angle: any, scaleX=1, scaleY=1) {
    this.ctx.save();
    this.ctx.lineWidth = 1;
    this.ctx.rotate(angle);
    this.ctx.scale(scaleX, scaleY);
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(-10, -20);
    this.ctx.lineTo(0, -20);
    this.ctx.lineTo(10, -20);
    this.ctx.lineTo(0, 0);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawRaysDistMarker(x: any, y: any, len: any, angle=0) {
    const height = DIST_MARKER_HEIGHT_FRACTION * this.height;
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(angle);
    this.ctx.lineWidth = 4;
    this.ctx.strokeStyle = DIST_MARKER_COLOR;
    this.ctx.fillStyle = DIST_MARKER_COLOR;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, height);
    this.ctx.moveTo(len, 0);
    this.ctx.lineTo(len, height);
    this.ctx.moveTo(0, 0.5 * height);
    this.ctx.lineTo(len, 0.5 * height);
    this.ctx.stroke();
    this.ctx.translate(0, 0.5 * height);
    this.drawArrow(Math.PI / 2, 0.9, 0.7);
    this.ctx.translate(len, 0);
    this.drawArrow(-Math.PI / 2, 0.9, 0.7);
    this.ctx.restore();
  }
}

function raysXDiff(solarAngle: any, width: any) {
  return width / (NUM_BEAMS + 1) / Math.sin(solarAngle);
}
