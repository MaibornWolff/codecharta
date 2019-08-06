import "../../state/state.module"
import angular from "angular"
import { edgePanelComponent } from "./edgePanel.component"

angular.module("app.codeCharta.ui.edgePanel", ["app.codeCharta.state"]).component(edgePanelComponent.selector, edgePanelComponent)
