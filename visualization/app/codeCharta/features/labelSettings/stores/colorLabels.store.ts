import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, ColorLabelOptions } from "../../../codeCharta.model"
import { colorLabelsSelector } from "../selectors/labelSettings.selectors"
import { setColorLabels } from "../../../appearance/appearance.facade"

@Injectable({
    providedIn: "root"
})
export class ColorLabelsStore {
    constructor(private readonly store: Store<CcState>) {}

    colorLabels$ = this.store.select(colorLabelsSelector)

    setColorLabels(value: Partial<ColorLabelOptions>) {
        this.store.dispatch(setColorLabels({ value }))
    }
}
