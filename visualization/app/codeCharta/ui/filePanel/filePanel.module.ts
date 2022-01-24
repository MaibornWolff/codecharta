import angular from "angular"

import "../../state/state.module"

import "../dialog/dialog.module"

import { filePanelComponent } from "./filePanel.component"
import { downgradeComponent } from "@angular/upgrade/static"
import { FilePanelFileSelectorComponent } from "./filePanelFileSelector/filePanelFileSelector.component"
import { FilePanelStateButtonsComponent } from "./filePanelStateButtons/filePanelStateButtons.component"
import { FilePanelDeltaSelectorComponent } from "./filePanelDeltaSelector/filePanelDeltaSelector.component"

angular
	.module("app.codeCharta.ui.filePanel", ["app.codeCharta.state"])
	.component(filePanelComponent.selector, filePanelComponent)
	.directive("ccFilePanelFileSelector", downgradeComponent({ component: FilePanelFileSelectorComponent }))
	.directive("ccFilePanelStateButtons", downgradeComponent({ component: FilePanelStateButtonsComponent }))
	.directive("ccFilePanelDeltaSelector", downgradeComponent({ component: FilePanelDeltaSelectorComponent }))
