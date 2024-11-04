import { Component } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../codeCharta.model"
import { isDeltaStateSelector } from "../../state/selectors/isDeltaState.selector"

@Component({
    selector: "cc-file-panel",
    templateUrl: "./filePanel.component.html",
    styleUrls: ["./filePanel.component.scss"]
})
export class FilePanelComponent {
    isDeltaState$ = this.store.select(isDeltaStateSelector)

    constructor(private store: Store<CcState>) {}
}
