import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { labelSizeSelector } from "../selectors/labelSettings.selectors"
import { setLabelSize } from "../../../appearance/appearance.facade"

@Injectable({
    providedIn: "root"
})
export class LabelSizeStore {
    constructor(private readonly store: Store<CcState>) {}

    labelSize$ = this.store.select(labelSizeSelector)

    setLabelSize(value: number) {
        this.store.dispatch(setLabelSize({ value }))
    }
}
