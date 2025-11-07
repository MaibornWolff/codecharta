import { Injectable } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { setState } from "../../../state/store/state.actions"
import { getPartialDefaultState } from "../../../ui/resetSettingsButton/getPartialDefaultState"

@Injectable({
    providedIn: "root"
})
export class ResetSettingsStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    resetSettings(settingsKeys: string[]) {
        const partialDefaultState = getPartialDefaultState(settingsKeys, this.state.getValue())
        this.store.dispatch(setState({ value: partialDefaultState }))
    }
}
