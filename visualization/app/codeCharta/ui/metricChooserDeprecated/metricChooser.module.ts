import { downgradeComponent } from "@angular/upgrade/static"
import angular from "angular"
import "../../state/state.module"
import { colorMetricChooserComponent, heightMetricChooserComponent } from "./metricChooser.component"
import { MetricValueHoveredComponent } from "./metricValueHovered/metricValueHovered.component"

angular.module("app.codeCharta.ui.metricChooser", ["app.codeCharta.state"])

angular
	.module("app.codeCharta.ui.metricChooser")
	.component(heightMetricChooserComponent.selector, heightMetricChooserComponent)
	.component(colorMetricChooserComponent.selector, colorMetricChooserComponent)
	.directive("ccMetricValueHovered", downgradeComponent({ component: MetricValueHoveredComponent }))
