import { Injectable } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { setState } from "../../../state/store/state.actions"
import { getPartialDefaultState } from "../../../state/store/util/getPartialDefaultState"

@Injectable({
    providedIn: "root"
})
export class ResetSettingsButtonStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    resetSettings(settingsKeys: string[]) {
        const partialDefaultState = getPartialDefaultState(settingsKeys, this.state.getValue())
        this.store.dispatch(setState({ value: partialDefaultState }))
    }
}
