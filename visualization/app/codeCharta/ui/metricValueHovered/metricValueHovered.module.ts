import "../../state/state.module"
import angular from "angular"
import {
	areaMetricValueHoveredComponent,
	heightMetricValueHoveredComponent,
	colorMetricValueHoveredComponent
} from "./metricValueHovered.component"
import { downgradeComponent } from "@angular/upgrade/static"
import { MetricTypeComponent } from "../metricChooser/metricType/metricType.component"

angular
	.module("app.codeCharta.ui.metricValueHovered", ["app.codeCharta.state"])
	.component(areaMetricValueHoveredComponent.selector, areaMetricValueHoveredComponent)
	.component(heightMetricValueHoveredComponent.selector, heightMetricValueHoveredComponent)
	.component(colorMetricValueHoveredComponent.selector, colorMetricValueHoveredComponent)
	.directive("ccMetricType", downgradeComponent({ component: MetricTypeComponent }))
