import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { setState } from "../../../stores/rootStore/state.actions"
import { defaultState } from "../../../stores/rootStore/state.manager"

/**
 * Resetting the map is just wiping the state — the metrics that follow are derived by the post-load
 * reconciliation from the files the reset dialog then reloads. The imperative first()-subscribe that
 * used to set the defaults here read the metric data of the map it had just wiped.
 */
@Injectable({ providedIn: "root" })
export class MapResetStore {
    constructor(private readonly store: Store<CcState>) {}

    resetState() {
        this.store.dispatch(setState({ value: defaultState }))
    }
}
