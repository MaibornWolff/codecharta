import "../../state/state.module"
import "../dialog/dialog.module"
import { FilePanelComponent } from "./filePanel.component"
import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FilePanelStateButtonsComponent } from "./filePanelStateButtons/filePanelStateButtons.component"
import { MaterialModule } from "../../../material/material.module"

@NgModule({
	imports: [CommonModule, MaterialModule],
	declarations: [FilePanelComponent, FilePanelStateButtonsComponent],
	exports: [FilePanelComponent]
})
export class FilePanelModule {}
