import angular from "angular"

import "../../state/state.module"

import "../dialog/dialog.module"

import { filePanelComponent } from "./filePanel.component"
import { downgradeComponent } from "@angular/upgrade/static"
import { FilePanelFileSelectorComponent } from "./filePanelFileSelector/filePanelFileSelector.component"
import { FilePanelStateButtonsComponent } from "./filePanelStateButtons/filePanelStateButtons.component"
import { FilePanelDeltaSelectorComponent } from "./filePanelDeltaSelector/filePanelDeltaSelector.component"
import { RemoveFileButtonComponent } from "./filePanelFileSelector/removeFileButton/removeFileButton.component"
import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MaterialModule } from "../../../material/material.module"
import { FormsModule } from "@angular/forms"
import { RemoveExtensionModule } from "../../util/removeExtensionModule"
import { FileSelectionModeService } from "./fileSelectionMode.service"

angular
	.module("app.codeCharta.ui.filePanel", ["app.codeCharta.state"])
	.component(filePanelComponent.selector, filePanelComponent)
	.directive("ccFilePanelFileSelector", downgradeComponent({ component: FilePanelFileSelectorComponent }))
	.directive("ccFilePanelStateButtons", downgradeComponent({ component: FilePanelStateButtonsComponent }))
	.directive("ccFilePanelDeltaSelector", downgradeComponent({ component: FilePanelDeltaSelectorComponent }))
	.directive("ccRemoveFileButton", downgradeComponent({ component: RemoveFileButtonComponent }))

@NgModule({
	imports: [CommonModule, MaterialModule, FormsModule, RemoveExtensionModule],
	declarations: [
		FilePanelDeltaSelectorComponent,
		FilePanelFileSelectorComponent,
		FilePanelStateButtonsComponent,
		RemoveFileButtonComponent
	],
	providers: [FileSelectionModeService],
	entryComponents: [FilePanelDeltaSelectorComponent, FilePanelFileSelectorComponent, FilePanelStateButtonsComponent]
})
export class FilePanelModule {}
