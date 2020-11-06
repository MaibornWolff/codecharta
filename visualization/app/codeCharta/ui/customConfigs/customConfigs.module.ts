import "../../state/state.module"
import angular from "angular"
import { customConfigsComponent } from "./customConfigs.component"

angular.module("app.codeCharta.ui.customConfigs", ["app.codeCharta.state"]).component(customConfigsComponent.selector, customConfigsComponent)
