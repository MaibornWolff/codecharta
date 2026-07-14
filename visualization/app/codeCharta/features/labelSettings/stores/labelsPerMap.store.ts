import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { labelsPerMapSelector } from "../../../stores/mapState/mapState.read.facade"
import { setLabelsPerMap } from "../../../stores/mapState/mapState.write.facade"

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
