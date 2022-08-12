"use strict"

import angular from "angular"
import camelCase from "lodash.camelcase"

import "./ui/ui"
import "./state/state.module"

import { codeChartaComponent } from "./codeCharta.component"
import { CodeChartaService } from "./codeCharta.service"
import { downgradeComponent } from "@angular/upgrade/static"
import { LoadingFileProgressSpinnerComponent } from "./ui/loadingFileProgressSpinner/loadingFileProgressSpinner.component"
import { FileExtensionBarComponent } from "./ui/fileExtensionBar/fileExtensionBar.component"

angular.module("app.codeCharta", ["app.codeCharta.state", "app.codeCharta.ui"])

angular
	.module("app.codeCharta")
	.component(codeChartaComponent.selector, codeChartaComponent)
	.service(camelCase(CodeChartaService.name), CodeChartaService)
	.directive("ccLoadingFileProgressSpinner", downgradeComponent({ component: LoadingFileProgressSpinnerComponent }))
	.directive("ccFileExtensionBar", downgradeComponent({ component: FileExtensionBarComponent }))
