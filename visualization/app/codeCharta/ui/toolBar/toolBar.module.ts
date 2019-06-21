import "../../state/state.module"
import angular from "angular"
import { toolBarComponent } from "./toolBar.component"

angular.module("app.codeCharta.ui.toolBar", ["app.codeCharta.state"])
    .component(toolBarComponent.selector, toolBarComponent)


