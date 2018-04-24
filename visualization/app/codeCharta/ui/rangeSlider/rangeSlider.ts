import angular from "angular";
import "../../core/core.module";
import {rangeSliderComponent} from "./rangeSlider.component";
import "angularjs-slider";

angular.module("app.codeCharta.ui.rangeSlider",["app.codeCharta.core", "rzModule"]);

angular.module("app.codeCharta.ui.rangeSlider").component(
    rangeSliderComponent.selector,
    rangeSliderComponent
);

