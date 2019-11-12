import "../../state/state.module"
import angular from "angular"
import { nodePathPanelComponent } from "./nodePathPanel.component"

angular
	.module("app.codeCharta.ui.nodePathPanel", ["app.codeCharta.state"])
	.component(nodePathPanelComponent.selector, nodePathPanelComponent)
