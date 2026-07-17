import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { CcStateSnapshot } from "../../../stores/rootStore/ccState.snapshot"
import { setState } from "../../../stores/rootStore/state.actions"
import { getPartialDefaultState } from "../getPartialDefaultState"

@Injectable({
    providedIn: "root"
})
export class ResetSettingsButtonStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly ccStateSnapshot: CcStateSnapshot
    ) {}

    resetSettings(settingsKeys: string[]) {
        const partialDefaultState = getPartialDefaultState(settingsKeys, this.ccStateSnapshot.get())
        this.store.dispatch(setState({ value: partialDefaultState }))
    }
}
