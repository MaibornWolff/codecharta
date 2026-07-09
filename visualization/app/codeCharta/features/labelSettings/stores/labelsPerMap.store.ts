import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { setLabelsPerMap } from "../../../stores/mapState/mapState.write.facade"
import { labelsPerMapSelector } from "../selectors/labelSettings.selectors"

@Injectable({
    providedIn: "root"
})
export class LabelsPerMapStore {
    constructor(private readonly store: Store<CcState>) {}

    labelsPerMap$ = this.store.select(labelsPerMapSelector)

    setLabelsPerMap(value: boolean) {
        this.store.dispatch(setLabelsPerMap({ value }))
    }
}
