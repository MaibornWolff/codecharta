import "../../state/state.module"
import "../dialog/dialog.module"

import angular from "angular"
import { toolBarComponent } from "./toolBar.component"
import { downgradeComponent } from "@angular/upgrade/static"
import { LoadingMapProgressSpinnerComponent } from "./loadingMapProgressSpinner/loadingMapProgressSpinner.component"
import { UploadFilesButtonComponent } from "./uploadFilesButton/uploadFilesButton.component"
import { GlobalConfigurationButtonComponent } from "./globalConfigurationButton/globalConfigurationButton.component"
import { HoveredNodePathPanelComponent } from "./hoveredNodePathPanel/hoveredNodePathPanel.component"
import { FilePanelComponent } from "../filePanel/filePanel.component"

angular
	.module("app.codeCharta.ui.toolBar", ["app.codeCharta.state", "app.codeCharta.ui.dialog"])
	.component(toolBarComponent.selector, toolBarComponent)
	.directive("ccLoadingMapProgressSpinner", downgradeComponent({ component: LoadingMapProgressSpinnerComponent }))
	.directive("ccUploadFilesButton", downgradeComponent({ component: UploadFilesButtonComponent }))
	.directive("ccGlobalConfigurationButton", downgradeComponent({ component: GlobalConfigurationButtonComponent }))
	.directive("ccHoveredNodePathPanel", downgradeComponent({ component: HoveredNodePathPanelComponent }))
	.directive("ccFilePanel", downgradeComponent({ component: FilePanelComponent }))
