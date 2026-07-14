import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, RecursivePartial } from "../../../model/codeCharta.model"
import { CcStateSnapshot } from "../../../stores/rootStore/ccState.snapshot"
import { setState } from "../../../stores/rootStore/state.actions"

@Injectable({ providedIn: "root" })
export class ScenariosStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly ccStateSnapshot: CcStateSnapshot
    ) {}

    getValue(): CcState {
        return this.ccStateSnapshot.get()
    }

    setStatePatch(value: RecursivePartial<CcState>) {
        this.store.dispatch(setState({ value }))
    }
}
