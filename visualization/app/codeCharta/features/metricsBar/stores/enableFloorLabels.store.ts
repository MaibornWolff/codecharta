import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { enableFloorLabelsSelector } from "../../../stores/mapState/mapState.read.facade"
import { setEnableFloorLabels } from "../../../stores/mapState/mapState.write.facade"

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
