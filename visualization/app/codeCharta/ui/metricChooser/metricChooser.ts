import angular from "angular";
import noUiSliderModule from 'angularjs-nouislider';
import "../../core/core.module";
import {
    areaMetricChooserComponent,
    colorMetricChooserComponent,
    heightMetricChooserComponent,
    horizontalMetricChooserComponent,
    metricChooserComponent
} from "./metricChooser.component";

angular.module("app.codeCharta.ui.metricChooser",["app.codeCharta.core", noUiSliderModule]);

angular.module("app.codeCharta.ui.metricChooser").component(
    metricChooserComponent.selector,
    metricChooserComponent
).component(
    horizontalMetricChooserComponent.selector,
    horizontalMetricChooserComponent
).component(
    areaMetricChooserComponent.selector,
    areaMetricChooserComponent
).component(
    heightMetricChooserComponent.selector,
    heightMetricChooserComponent
).component(
    colorMetricChooserComponent.selector,
    colorMetricChooserComponent
);

