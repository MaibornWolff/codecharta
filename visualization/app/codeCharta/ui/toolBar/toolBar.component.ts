import { Component } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { hoveredNodeIdSelector } from "../../state/store/appStatus/hoveredNodeId/hoveredNodeId.selector"
import { Store } from "@ngrx/store"
import { CcState } from "../../codeCharta.model"
import { UploadFilesButtonComponent } from "./uploadFilesButton/uploadFilesButton.component"
import { ScreenshotButtonComponent } from "../screenshotButton/screenshotButton.component"
import { CopyToClipboardButtonComponent } from "../copyToClipboardButton/copyToClipboardButton.component"
import { Export3DMapButtonComponent } from "../export3DMapButton/export3DMapButton.component"
import { ResetMapButtonComponent } from "../resetMapButton/resetMapButton.component"
import { FilePanelComponent } from "../filePanel/filePanel.component"
import { HoveredNodePathPanelComponent } from "./hoveredNodePathPanel/hoveredNodePathPanel.component"
import { LoadingMapProgressSpinnerComponent } from "./loadingMapProgressSpinner/loadingMapProgressSpinner.component"
import { PresentationModeButtonComponent } from "./presentationModeButton/presentationModeButton.component"
import { GlobalConfigurationButtonComponent } from "../../features/globalSettings/components/globalConfigurationButton/globalConfigurationButton.component"

@Component({
    selector: "cc-tool-bar",
    templateUrl: "./toolBar.component.html",
    imports: [
        UploadFilesButtonComponent,
        ScreenshotButtonComponent,
        CopyToClipboardButtonComponent,
        Export3DMapButtonComponent,
        ResetMapButtonComponent,
        FilePanelComponent,
        HoveredNodePathPanelComponent,
        LoadingMapProgressSpinnerComponent,
        PresentationModeButtonComponent,
        GlobalConfigurationButtonComponent
    ]
})
export class ToolBarComponent {
    hoveredNodeId = toSignal(this.store.select(hoveredNodeIdSelector))

    constructor(private readonly store: Store<CcState>) {}
}
