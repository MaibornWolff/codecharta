import "../../state/state.module"
import angular from "angular"
import { floatingPanelComponent } from "./floatingPanel.component"

angular.module("app.codeCharta.ui.floatingPanel", ["app.codeCharta.state"])
    .component(floatingPanelComponent.selector, floatingPanelComponent)


