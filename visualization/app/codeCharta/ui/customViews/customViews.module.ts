import "../../state/state.module"
import angular from "angular"
import { customViewsComponent } from "./customViews.component"

angular.module("app.codeCharta.ui.customViews", ["app.codeCharta.state"]).component(customViewsComponent.selector, customViewsComponent)
