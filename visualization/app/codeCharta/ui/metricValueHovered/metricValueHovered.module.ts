import "../../state/state.module"
import angular from "angular"
import {
	areaMetricValueHoveredComponent,
	heightMetricValueHoveredComponent,
	colorMetricValueHoveredComponent
} from "./metricValueHovered.component"

angular
	.module("app.codeCharta.ui.metricValueHovered", ["app.codeCharta.state"])
	.component(areaMetricValueHoveredComponent.selector, areaMetricValueHoveredComponent)
	.component(heightMetricValueHoveredComponent.selector, heightMetricValueHoveredComponent)
	.component(colorMetricValueHoveredComponent.selector, colorMetricValueHoveredComponent)
