import angular from "angular"
import "@uirouter/angularjs"

import { layoutSwitcherComponent } from "./layoutSwitcher.component"

angular.module("app.codeCharta.ui.layoutSwitcher", ["ui.router"]).component(layoutSwitcherComponent.selector, layoutSwitcherComponent)
