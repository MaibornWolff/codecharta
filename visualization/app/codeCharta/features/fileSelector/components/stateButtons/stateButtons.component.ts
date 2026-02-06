import { Component, computed } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"
import { isDeltaStateSelector } from "../../../../state/selectors/isDeltaState.selector"
import { FileSelectionModeService } from "../../services/fileSelectionMode.service"

@Component({
    selector: "cc-state-buttons",
    templateUrl: "./stateButtons.component.html"
})
export class StateButtonsComponent {
    private readonly isDeltaState = toSignal(this.store.select(isDeltaStateSelector), { initialValue: false })

    isStandardMode = computed(() => !this.isDeltaState())
    isDeltaMode = computed(() => this.isDeltaState())

    constructor(
        private readonly store: Store<CcState>,
        private readonly fileSelectionModeService: FileSelectionModeService
    ) {}

    toggle() {
        this.fileSelectionModeService.toggle()
    }
}
