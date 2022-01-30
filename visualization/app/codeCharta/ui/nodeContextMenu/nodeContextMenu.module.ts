import "../../state/state.module"
import "../../ui/ui"

import angular from "angular"
import { downgradeComponent } from "@angular/upgrade/static"

import { nodeContextMenuComponent } from "./nodeContextMenu.component"
import { NodeContextMenuCardComponent } from "./nodeContextMenuCard/nodeContextMenuCard.component"

angular
	.module("app.codeCharta.ui.nodeContextMenu", ["app.codeCharta.state", "app.codeCharta.ui"])
	.component(nodeContextMenuComponent.selector, nodeContextMenuComponent)
	.directive("ccNodeContextMenuCard", downgradeComponent({ component: NodeContextMenuCardComponent }))
