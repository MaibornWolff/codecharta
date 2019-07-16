import "../../state/state.module"
import "../codeMap/threeViewer/threeViewer.module"
import angular from "angular"
import { centerMapButtonComponent } from "./centerMapButton.component"

angular
	.module("app.codeCharta.ui.centerMapButton", ["app.codeCharta.state", "app.codeCharta.ui.codeMap.threeViewer"])
	.component(centerMapButtonComponent.selector, centerMapButtonComponent)
