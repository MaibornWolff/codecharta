import angular from "angular"
import { downgradeComponent } from "@angular/upgrade/static"

import "../../state/state.module"
import "../codeMap/codeMap.module"
import "../../codeCharta.module"

import "./mapTreeView.component.scss"

import { mapTreeViewComponent } from "./mapTreeView.component"
import { MapTreeViewLevel } from "./mapTreeView.level.component"

import { MapTreeViewLevelItemIcon } from "./mapTreeViewLevelItemIcon/mapTreeViewLevelItemIcon.component"
import { MapTreeViewLevelItemContent } from "./mapTreeViewLevelItemContent/mapTreeViewLevelItemContent.component"

angular
	.module("app.codeCharta.ui.mapTreeView", ["app.codeCharta.state", "app.codeCharta.ui.codeMap", "app.codeCharta"])
	.component(mapTreeViewComponent.selector, mapTreeViewComponent)
	.directive("ccMapTreeViewLevel", downgradeComponent({ component: MapTreeViewLevel }))
	.directive("ccMapTreeViewLevelItemIcon", downgradeComponent({ component: MapTreeViewLevelItemIcon }))
	.directive("ccMapTreeViewLevelItemContent", downgradeComponent({ component: MapTreeViewLevelItemContent }))
