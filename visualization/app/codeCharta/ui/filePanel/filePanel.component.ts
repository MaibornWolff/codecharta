import { Component } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../codeCharta.model"
import { isDeltaStateSelector } from "../../state/selectors/isDeltaState.selector"
import { FilePanelStateButtonsComponent } from "./filePanelStateButtons/filePanelStateButtons.component"
import { FilePanelFileSelectorComponent } from "./filePanelFileSelector/filePanelFileSelector.component"
import { FilePanelDeltaSelectorComponent } from "./filePanelDeltaSelector/filePanelDeltaSelector.component"
import { AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-file-panel",
    templateUrl: "./filePanel.component.html",
    styleUrls: ["./filePanel.component.scss"],
    standalone: true,
    imports: [FilePanelStateButtonsComponent, FilePanelFileSelectorComponent, FilePanelDeltaSelectorComponent, AsyncPipe]
})
export class FilePanelComponent {
    isDeltaState$ = this.store.select(isDeltaStateSelector)

    constructor(private store: Store<CcState>) {}
}
