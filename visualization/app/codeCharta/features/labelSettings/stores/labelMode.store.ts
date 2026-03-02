import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, LabelMode } from "../../../codeCharta.model"
import { labelModeSelector } from "../selectors/labelSettings.selectors"
import { setLabelMode } from "../../../state/store/appSettings/labelMode/labelMode.actions"

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
