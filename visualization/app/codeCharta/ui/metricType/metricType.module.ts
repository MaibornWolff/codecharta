import "../../state/state.module"
import angular from "angular"
import { areaMetricTypeComponent, colorMetricTypeComponent, heightMetricTypeComponent } from "./metricType.component"

angular
	.module("app.codeCharta.ui.metricType", ["app.codeCharta.state"])
	.component(areaMetricTypeComponent.selector, areaMetricTypeComponent)
	.component(heightMetricTypeComponent.selector, heightMetricTypeComponent)
	.component(colorMetricTypeComponent.selector, colorMetricTypeComponent)
