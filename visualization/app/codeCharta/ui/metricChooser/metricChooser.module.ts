import angular from "angular"
import "../../state/state.module"
import {
	areaMetricChooserComponent,
	colorMetricChooserComponent,
	heightMetricChooserComponent,
	distribitionMetricChooserComponent
} from "./metricChooser.component"

angular.module("app.codeCharta.ui.metricChooser", ["app.codeCharta.state"])

angular
	.module("app.codeCharta.ui.metricChooser")
	.component(areaMetricChooserComponent.selector, areaMetricChooserComponent)
	.component(heightMetricChooserComponent.selector, heightMetricChooserComponent)
	.component(colorMetricChooserComponent.selector, colorMetricChooserComponent)
	.component(distribitionMetricChooserComponent.selector, distribitionMetricChooserComponent)
