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
import { ScreenshotButtonComponent } from "../screenshotButton/screenshotButton.component"
import { CopyToClipboardButtonComponent } from "../copyToClipboardButton/copyToClipboardButton.component"
import { DownloadButtonComponent } from "./downloadButton/downloadButton.component"

angular
	.module("app.codeCharta.ui.toolBar", ["app.codeCharta.state", "app.codeCharta.ui.dialog"])
	.component(toolBarComponent.selector, toolBarComponent)
	.directive("ccLoadingMapProgressSpinner", downgradeComponent({ component: LoadingMapProgressSpinnerComponent }))
	.directive("ccUploadFilesButton", downgradeComponent({ component: UploadFilesButtonComponent }))
	.directive("ccGlobalConfigurationButton", downgradeComponent({ component: GlobalConfigurationButtonComponent }))
	.directive("ccHoveredNodePathPanel", downgradeComponent({ component: HoveredNodePathPanelComponent }))
	.directive("ccScreenshotButton", downgradeComponent({ component: ScreenshotButtonComponent }))
	.directive("ccFilePanel", downgradeComponent({ component: FilePanelComponent }))
	.directive("ccCopyToClipboardButton", downgradeComponent({ component: CopyToClipboardButtonComponent }))
	.directive("ccDownloadButton", downgradeComponent({ component: DownloadButtonComponent }))
