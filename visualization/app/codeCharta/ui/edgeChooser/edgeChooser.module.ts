import "../../state/state.module"
import angular from "angular"
import { edgeChooserComponent } from "./edgeChooser.component"
import { downgradeComponent } from "@angular/upgrade/static"
import { MetricTypeHoveredComponent } from "../metricChooser/metricTypeHovered/metricTypeHovered.component"

angular
	.module("app.codeCharta.ui.edgeChooser", ["app.codeCharta.state"])
	.component(edgeChooserComponent.selector, edgeChooserComponent)
	.directive("ccMetricTypeHovered", downgradeComponent({ component: MetricTypeHoveredComponent }))
