import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, LabelMode } from "../../../model/codeCharta.model"
import { labelModeSelector } from "../../../stores/mapState/mapState.read.facade"
import { setLabelMode } from "../../../stores/mapState/mapState.write.facade"

@Injectable({
    providedIn: "root"
})
export class LabelModeStore {
    constructor(private readonly store: Store<CcState>) {}

    labelMode$ = this.store.select(labelModeSelector)

    setLabelMode(value: LabelMode) {
        this.store.dispatch(setLabelMode({ value }))
    }
}
