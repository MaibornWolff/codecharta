import "../../state/state.module"
import angular from "angular"
import { treeMapStartDepthComponent } from "./treeMapStartDepth.component"

angular
	.module("app.codeCharta.ui.treeMapStartDepth", ["app.codeCharta.state"])
	.component(treeMapStartDepthComponent.selector, treeMapStartDepthComponent)
