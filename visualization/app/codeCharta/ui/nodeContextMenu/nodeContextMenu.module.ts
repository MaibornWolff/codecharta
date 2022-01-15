import "../../state/state.module"
import "../../ui/ui"

import angular from "angular"
import { downgradeComponent } from "@angular/upgrade/static"

import { nodeContextMenuComponent } from "./nodeContextMenu.component"
import { FocusButtonsComponent } from "./focusButtons/focusButtons.component"
import { MarkFolderRowComponent } from "./markFolderRow/markFolderRow.component"

angular
	.module("app.codeCharta.ui.nodeContextMenu", ["app.codeCharta.state", "app.codeCharta.ui"])
	.component(nodeContextMenuComponent.selector, nodeContextMenuComponent)
	.directive("ccMarkFolderRow", downgradeComponent({ component: MarkFolderRowComponent }))
	.directive("ccFocusButtons", downgradeComponent({ component: FocusButtonsComponent }))
