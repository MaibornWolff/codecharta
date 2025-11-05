import { Component, input, output } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { CcState } from "../../../../../codeCharta.model"
import { getPartialDefaultState } from "../../../../resetSettingsButton/getPartialDefaultState"
import { setState } from "../../../../../state/store/state.actions"

@Component({
    selector: "cc-reset-settings-button",
    templateUrl: "./resetSettingsButton.component.html",
    imports: []
})
export class ResetSettingsButtonComponent {
    settingsKeys = input.required<string[]>()
    tooltip = input<string>()
    label = input<string>()
    callback = output<void>()

    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    applyDefaultSettings() {
        const partialDefaultState = getPartialDefaultState(this.settingsKeys(), this.state.getValue())
        this.store.dispatch(setState({ value: partialDefaultState }))

        this.callback.emit()
    }
}
