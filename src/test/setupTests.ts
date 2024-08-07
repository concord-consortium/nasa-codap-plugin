import "@testing-library/jest-dom";
import $ from "jquery";

declare global {
  interface Window {
    $: typeof $;
    jQuery: typeof $;
  }
}

window.$ = window.jQuery = $;
