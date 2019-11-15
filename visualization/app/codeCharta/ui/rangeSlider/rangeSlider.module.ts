import angular from "angular"
import "../../state/state.module"
import "../../codeCharta.module"
import { rangeSliderComponent } from "./rangeSlider.component"
import "angularjs-slider"

angular.module("app.codeCharta.ui.rangeSlider", ["app.codeCharta.state", "rzSlider", "app.codeCharta"])

angular.module("app.codeCharta.ui.rangeSlider").component(rangeSliderComponent.selector, rangeSliderComponent)
