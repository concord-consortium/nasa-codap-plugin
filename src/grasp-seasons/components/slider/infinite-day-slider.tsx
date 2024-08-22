import $ from "jquery";
import Slider from "./slider";
import t from "../../translation/translate";

import "./infinite-slider-jquery-ui-plugin";

const MONTH_LEN = 30.4;

export default class InfiniteDaySlider extends Slider {
  // $slider: any;
  getSliderOpts: any;
  props: any;
  sliderFuncName: any;
  constructor(props: any) {
    super(props);
    // Custom, tweaked jQuery UI slider (defined in ui/grasp-slider).
    this.sliderFuncName = "infiniteSlider";
  }

  componentDidMount() {
    super.componentDidMount();
    this.$slider.infiniteSlider({
      min: 0,
      max: 364,
      step: 1
    });
    this.generateMonthTicks(this.props.lang);
  }

  UNSAFE_componentWillReceiveProps(nextProps: any){
    if (this.props.lang !== nextProps.lang){
      $(".ui-slider-tick").remove();
      this.generateMonthTicks(nextProps.lang);
    }
    const options = this.getSliderOpts(nextProps);
    const value = options.value;
    if (value !== undefined) {
      const date = new Date(2024, 0);
      date.setDate(value + 1);
      const month = date.getMonth();
      this.$slider.find(".ui-slider-tick-label").each(function(this: any, idx: number) {
        const $label = $(this);
        if (idx === month) {
          $label.addClass("active");
        } else {
          $label.removeClass("active");
        }
      });
    }
    this.$slider[this.sliderFuncName](options);
  }

  generateMonthTicks(lang: any) {
    const ticks = [];
    const months = t("~MONTHS_SHORT", lang);
    for (let m = 0; m < 12; m++) {
      ticks.push({ value: m * MONTH_LEN, name: months[m] });
    }
    this.$slider.infiniteSlider("option", "ticks", ticks);
    // Shift tick labels so they are in the middle of the month section on the slider.
    const monthWidth = this.$slider.width() / 12;
    this.$slider.find(".ui-slider-tick-label").each(function(this: any) {
      const $label = $(this);
      const labelWidth = $label.width();
      if (labelWidth) {
        $label.css("margin-left", -labelWidth * 0.5 + monthWidth * 0.5);
      }
    });
  }
}
