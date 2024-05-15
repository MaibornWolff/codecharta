import { Component, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { isDeltaStateSelector } from "../../../state/selectors/isDeltaState.selector"
import { FileSelectionModeService } from "../fileSelectionMode.service"

@Component({
    selector: "cc-file-panel-state-buttons",
    templateUrl: "./filePanelStateButtons.component.html",
    encapsulation: ViewEncapsulation.None
})
export class FilePanelStateButtonsComponent {
    isDeltaState$ = this.store.select(isDeltaStateSelector)

    constructor(
        private store: Store<CcState>,
        public fileSelectionModeService: FileSelectionModeService
    ) {}
}
