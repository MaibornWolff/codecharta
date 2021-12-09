import "../../state/state.module"
import "../dialog/dialog.module"
import { FilePanelComponent } from "./filePanel.component"
import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FilePanelStateButtonsComponent } from "./filePanelStateButtons/filePanelStateButtons.component"
import { FilePanelFileSelectorComponent } from "./filePanelFileSelector/filePanelFileSelector.component"
import { MaterialModule } from "../../../material/material.module"

@NgModule({
	imports: [CommonModule, MaterialModule],
	declarations: [FilePanelComponent, FilePanelStateButtonsComponent, FilePanelFileSelectorComponent],
	exports: [FilePanelComponent]
})
export class FilePanelModule {}
