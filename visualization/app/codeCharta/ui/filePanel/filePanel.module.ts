import { FilePanelFileSelectorComponent } from "./filePanelFileSelector/filePanelFileSelector.component"
import { FilePanelStateButtonsComponent } from "./filePanelStateButtons/filePanelStateButtons.component"
import { FilePanelDeltaSelectorComponent } from "./filePanelDeltaSelector/filePanelDeltaSelector.component"
import { RemoveFileButtonComponent } from "./filePanelFileSelector/removeFileButton/removeFileButton.component"
import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"

import { FormsModule } from "@angular/forms"
import { FileSelectionModeService } from "./fileSelectionMode.service"
import { FilePanelComponent } from "./filePanel.component"

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
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
