import "../../state/state.module"
import angular from "angular"
import { structurePanelSelectorComponent } from "./structurePanelSelector.component"

angular.module("app.codeCharta.ui.structurePanelSelector", ["app.codeCharta.state"])
    .component(structurePanelSelectorComponent.selector, structurePanelSelectorComponent)


