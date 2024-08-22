import $ from "jquery";
import "jquery-ui/ui/widgets/slider";

const TICK_WIDTH = 1;

// Patched jQueryUI slider that can wrap. When user drags slider handle over max (or min) value,
// it will jump back to min (or max).
// It also supports 'ticks' option.
($ as any).widget("ui.infiniteSlider", ($ as any).ui.slider, {
  _create () {
    this._super();
  },
  _setOption (key: any, value: any, ...args: any[]) {
    this._superApply([key, value, ...args]);
    if (key === "ticks") {
      const valueTotal = this._valueMax() - this._valueMin();
      value.forEach(function(this: any, t: any) {
        const percentValue = t.value / valueTotal * 100;
        const tick = $("<div></div>").addClass("ui-slider-tick").css({
          left: percentValue + "%"
        });
        const mark = $("<div></div>").addClass("ui-slider-tick-mark").css({
          height: this.element.height(),
          width: TICK_WIDTH + "px",
          "margin-left": (-0.5 * TICK_WIDTH) + "px",
        });
        const label = $("<div></div>").addClass("ui-slider-tick-label").text(t.name);
        mark.appendTo(tick);
        label.appendTo(tick);
        tick.appendTo(this.element);
        // We can do it at the very end, when the element is rendered and its width can be calculated.
        const labelWidth = label.width();
        if (labelWidth) {
          label.css("margin-left", (-0.5 * labelWidth) + "px");
        }
      }.bind(this));
      this.element.addClass("ui-slider-with-tick-labels");
    }
  },

  _normValueFromMouse( position: any ) {
    let pixelTotal, pixelMouse, percentMouse;

    if ( this.orientation === "horizontal" ) {
      pixelTotal = this.elementSize.width;
      pixelMouse = position.x - this.elementOffset.left - ( this._clickOffset ? this._clickOffset.left : 0 );
    } else {
      pixelTotal = this.elementSize.height;
      pixelMouse = position.y - this.elementOffset.top - ( this._clickOffset ? this._clickOffset.top : 0 );
    }

    percentMouse = ( pixelMouse / pixelTotal );
    // Original jQuery UI code:
    // if ( percentMouse > 1 ) {
    //   percentMouse = 1;
    // }
    // if ( percentMouse < 0 ) {
    //   percentMouse = 0;
    // }
    // === Customization ===
    percentMouse = percentMouse % 1;
    if ( percentMouse < 0 ) {
      percentMouse += 1;
    }
    // =====================
    if ( this.orientation === "vertical" ) {
      percentMouse = 1 - percentMouse;
    }

    const valueTotal = this._valueMax() - this._valueMin();
    const valueMouse = this._valueMin() + percentMouse * valueTotal;

    return this._trimAlignValue( valueMouse );
  }
});
