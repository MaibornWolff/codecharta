import "../../state/state.module"
import angular from "angular"
import { metricTypeComponent } from "./metricType.component"

angular
	.module("app.codeCharta.ui.metricType", ["app.codeCharta.state"])
	.component(metricTypeComponent.selector, metricTypeComponent)
