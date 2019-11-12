import "../../state/state.module"
import angular from "angular"
import { metricDeltaSelectedComponent } from "./metricDeltaSelected.component"

angular
	.module("app.codeCharta.ui.metricDeltaSelected", ["app.codeCharta.state"])
	.component(metricDeltaSelectedComponent.selector, metricDeltaSelectedComponent)
