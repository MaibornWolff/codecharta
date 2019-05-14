"use strict"

import "../../ui/ui"
import "../../state/state.module"

import angular from "angular"
import { sidenavComponent, sidenavToggleComponent } from "./sidenav.component"

angular
	.module("app.codeCharta.ui.sidenav", ["app.codeCharta.ui", "app.codeCharta.state"])
	.component(sidenavComponent.selector, sidenavComponent)
	.component(sidenavToggleComponent.selector, sidenavToggleComponent)
