import { Component } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { isDeltaStateSelector } from "../../../state/selectors/isDeltaState.selector"
import { FileSelectionModeService } from "../fileSelectionMode.service"
import { MatButton } from "@angular/material/button"
import { AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-file-panel-state-buttons",
    templateUrl: "./filePanelStateButtons.component.html",
    styleUrls: ["./filePanelStateButtons.component.scss"],
    standalone: true,
    imports: [MatButton, AsyncPipe]
})
export class FilePanelStateButtonsComponent {
    isDeltaState$ = this.store.select(isDeltaStateSelector)

    constructor(
        private store: Store<CcState>,
        public fileSelectionModeService: FileSelectionModeService
    ) {}
}
