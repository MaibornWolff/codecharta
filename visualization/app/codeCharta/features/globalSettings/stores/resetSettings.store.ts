import { Injectable } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { setState } from "../../../store/state.actions"
import { getPartialDefaultState } from "../../../store/getPartialDefaultState"

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
