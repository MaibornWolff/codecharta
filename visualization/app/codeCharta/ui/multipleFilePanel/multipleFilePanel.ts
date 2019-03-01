import "../rangeSlider/rangeSlider"
import "../../core/core.module"

import angular from "angular"

import { multipleFilePanelComponent } from "./multipleFilePanel.component"

angular
	.module("app.codeCharta.ui.multipleFilePanel", ["app.codeCharta.ui.rangeSlider", "app.codeCharta.core"])
	.component(multipleFilePanelComponent.selector, multipleFilePanelComponent)
