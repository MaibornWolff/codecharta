import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { enableFloorLabelsSelector, setEnableFloorLabels } from "../../../mapState/mapState.facade"

@Injectable({
    providedIn: "root"
})
export class EnableFloorLabelsStore {
    constructor(private readonly store: Store<CcState>) {}

    enableFloorLabels$ = this.store.select(enableFloorLabelsSelector)

    setEnableFloorLabels(value: boolean) {
        this.store.dispatch(setEnableFloorLabels({ value }))
    }
}
