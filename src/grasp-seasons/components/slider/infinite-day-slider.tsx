import $ from "jquery";
import Slider from "./slider";
import t from "../../translation/translate";

import "./infinite-slider-jquery-ui-plugin";

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

    this.$slider[this.sliderFuncName](this.getSliderOpts(nextProps));
  }

  generateMonthTicks(lang: any) {
    const ticks = [];
    const months = t("~MONTHS_SHORT", lang);
    for (let m = 0; m < 12; m++) {
      ticks.push({ value: m * 30.4, name: months[m] });
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
