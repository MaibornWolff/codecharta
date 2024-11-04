import { FilePanelFileSelectorComponent } from "./filePanelFileSelector/filePanelFileSelector.component"
import { FilePanelStateButtonsComponent } from "./filePanelStateButtons/filePanelStateButtons.component"
import { FilePanelDeltaSelectorComponent } from "./filePanelDeltaSelector/filePanelDeltaSelector.component"
import { RemoveFileButtonComponent } from "./filePanelFileSelector/removeFileButton/removeFileButton.component"
import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MaterialModule } from "../../../material/material.module"
import { FormsModule } from "@angular/forms"
import { FileSelectionModeService } from "./fileSelectionMode.service"
import { FilePanelComponent } from "./filePanel.component"
import { RemoveExtensionPipeModule } from "../../util/pipes/RemoveExtensionPipeModule"

@NgModule({
    imports: [CommonModule, MaterialModule, FormsModule, RemoveExtensionPipeModule],
    declarations: [
        FilePanelDeltaSelectorComponent,
        FilePanelFileSelectorComponent,
        FilePanelStateButtonsComponent,
        RemoveFileButtonComponent,
        FilePanelComponent
    ],
    providers: [FileSelectionModeService],
    exports: [FilePanelComponent]
})
export class FilePanelModule {}
