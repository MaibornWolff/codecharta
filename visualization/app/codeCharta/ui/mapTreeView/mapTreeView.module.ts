import angular from "angular"
import "../../state/state.module"
import "../codeMap/codeMap.module"
import "../../codeCharta.module"

import "./mapTreeView.component.scss"

import { mapTreeViewComponent } from "./mapTreeView.component"
import { downgradeComponent } from "@angular/upgrade/static"
import { MapTreeViewLevel } from "./mapTreeViewLevel/mapTreeViewLevel.component"

angular
	.module("app.codeCharta.ui.mapTreeView", ["app.codeCharta.state", "app.codeCharta.ui.codeMap", "app.codeCharta"])
	.component(mapTreeViewComponent.selector, mapTreeViewComponent)
	.directive("ccMapTreeViewLevel", downgradeComponent({ component: MapTreeViewLevel }))
