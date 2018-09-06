import angular from "angular";
import noUiSliderModule from 'angularjs-nouislider';
import "../../core/core.module";
import {
    areaMetricChooserComponent,
    colorMetricChooserComponent,
    heightMetricChooserComponent
} from "./metricChooser.component";

angular.module("app.codeCharta.ui.metricChooser",["app.codeCharta.core", noUiSliderModule]);

angular.module("app.codeCharta.ui.metricChooser").component(
    areaMetricChooserComponent.selector,
    areaMetricChooserComponent
).component(
    heightMetricChooserComponent.selector,
    heightMetricChooserComponent
).component(
    colorMetricChooserComponent.selector,
    colorMetricChooserComponent
);

