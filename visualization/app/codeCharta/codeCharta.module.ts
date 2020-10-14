"use strict"

import angular from "angular"
import camelCase from "lodash.camelcase"

import "./ui/ui"
import "./state/state.module"

import { codeChartaComponent } from "./codeCharta.component"
import { CodeChartaService } from "./codeCharta.service"
import { CodeChartaMouseEventService } from "./codeCharta.mouseEvent.service"

angular.module("app.codeCharta", ["app.codeCharta.state", "app.codeCharta.ui"])

angular
	.module("app.codeCharta")
	.component(codeChartaComponent.selector, codeChartaComponent)
	.service(camelCase(CodeChartaService.name), CodeChartaService)
	.service(camelCase(CodeChartaMouseEventService.name), CodeChartaMouseEventService)
