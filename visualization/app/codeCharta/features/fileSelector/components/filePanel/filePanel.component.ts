import { Component, computed } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"
import { isDeltaStateSelector } from "../../../../state/selectors/isDeltaState.selector"
import { StateButtonsComponent } from "../stateButtons/stateButtons.component"
import { FileSelectorDropdownComponent } from "../fileSelectorDropdown/fileSelectorDropdown.component"
import { DeltaSelectorComponent } from "../deltaSelector/deltaSelector.component"

@Component({
    selector: "cc-file-panel",
    templateUrl: "./filePanel.component.html",
    host: {
        class: "flex gap-3"
    },
    imports: [StateButtonsComponent, FileSelectorDropdownComponent, DeltaSelectorComponent]
})
export class FilePanelComponent {
    private readonly isDeltaState = toSignal(this.store.select(isDeltaStateSelector), { initialValue: false })

    isStandardMode = computed(() => !this.isDeltaState())
    isDeltaMode = computed(() => this.isDeltaState())

    constructor(private readonly store: Store<CcState>) {}
}
