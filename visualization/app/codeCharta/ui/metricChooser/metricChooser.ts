import angular from "angular";
import "../../core/core.module";
import {
    areaMetricChooserComponent, horizontalMetricChooserComponent,
    metricChooserComponent
} from "./metricChooser.component";

angular.module("app.codeCharta.ui.metricChooser",["app.codeCharta.core"]);

angular.module("app.codeCharta.ui.metricChooser").component(
    metricChooserComponent.selector,
    metricChooserComponent
).component(
    horizontalMetricChooserComponent.selector,
    horizontalMetricChooserComponent
).component(
    areaMetricChooserComponent.selector,
    areaMetricChooserComponent
);

