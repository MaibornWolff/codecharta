"use strict"

import angular from "angular"

import "./ui/ui"
import "./state/state.module"

import { codeChartaComponent } from "./codeCharta.component"
import { LoadFileService } from "./services/loadFile/loadFile.service"
import { downgradeComponent, downgradeInjectable } from "@angular/upgrade/static"
import { LoadingFileProgressSpinnerComponent } from "./ui/loadingFileProgressSpinner/loadingFileProgressSpinner.component"
import { FileExtensionBarComponent } from "./ui/fileExtensionBar/fileExtensionBar.component"
import { ToolBarComponent } from "./ui/toolBar/toolBar.component"
import { RibbonBarComponent } from "./ui/ribbonBar/ribbonBar.component"
import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { CodeMapComponent } from "./ui/codeMap/codeMap.component"
import { CodeMapModule } from "./ui/codeMap/codeMap.module"
import { MatDialog } from "@angular/material/dialog"
import { LoadInitialFileService } from "./services/loadInitialFile/loadInitialFile.service"

angular.module("app.codeCharta", ["app.codeCharta.state", "app.codeCharta.ui"])

angular
	.module("app.codeCharta")
	.component(codeChartaComponent.selector, codeChartaComponent)
	.directive("ccLoadingFileProgressSpinner", downgradeComponent({ component: LoadingFileProgressSpinnerComponent }))
	.directive("ccFileExtensionBar", downgradeComponent({ component: FileExtensionBarComponent }))
	.directive("ccToolBar", downgradeComponent({ component: ToolBarComponent }))
	.directive("ccRibbonBar", downgradeComponent({ component: RibbonBarComponent }))
	.directive("ccCodeMap", downgradeComponent({ component: CodeMapComponent }))
	.factory("dialog", downgradeInjectable(MatDialog))
	.factory("loadFileService", downgradeInjectable(LoadFileService))
	.factory("loadInitialFileService", downgradeInjectable(LoadInitialFileService))

@NgModule({
	imports: [CommonModule, CodeMapModule],
	entryComponents: [CodeMapComponent]
})
export class CodeChartaModule {}
