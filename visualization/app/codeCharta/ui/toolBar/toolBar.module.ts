import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { UploadFilesButtonModule } from "./uploadFilesButton/uploadFilesButton.module"
import { GlobalConfigurationButtonModule } from "./globalConfigurationButton/globalConfigurationButton.module"
import { HoveredNodePathPanelModule } from "./hoveredNodePathPanel/hoveredNodePathPanel.module"
import { ScreenshotButtonModule } from "../screenshotButton/screenshotButton.module"
import { FilePanelModule } from "../filePanel/filePanel.module"
import { CopyToClipboardButtonModule } from "../copyToClipboardButton/copyToClipboardButton.module"
import { PresentationModeButtonModule } from "./presentationModeButton/presentationModeButton.module"
import { ToolBarComponent } from "./toolBar.component"
import { Export3DMapButtonModule } from "../export3DMapButton/export3DMapButton.module"
import { LoadingMapProgressSpinnerModule } from "./loadingMapProgressSpinner/loadingMapProgressSpinner.module"
import { ResetMapButtonModule } from "../resetMapButton/resetMapButton.module"

@NgModule({
    imports: [
        CommonModule,
        UploadFilesButtonModule,
        ScreenshotButtonModule,
        CopyToClipboardButtonModule,
        Export3DMapButtonModule,
        ResetMapButtonModule,
        FilePanelModule,
        HoveredNodePathPanelModule,
        LoadingMapProgressSpinnerModule,
        PresentationModeButtonModule,
        GlobalConfigurationButtonModule
    ],
    declarations: [ToolBarComponent],
    exports: [ToolBarComponent]
})
export class ToolBarModule {}
