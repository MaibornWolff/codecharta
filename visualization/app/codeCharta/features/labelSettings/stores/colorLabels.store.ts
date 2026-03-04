import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, ColorLabelOptions } from "../../../codeCharta.model"
import { colorLabelsSelector } from "../selectors/labelSettings.selectors"
import { setColorLabels } from "../../../state/store/appSettings/colorLabels/colorLabels.actions"

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
