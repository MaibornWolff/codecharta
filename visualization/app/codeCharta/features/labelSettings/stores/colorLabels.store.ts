import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, ColorLabelOptions } from "../../../model/codeCharta.model"
import { setColorLabels } from "../../../stores/mapState/mapState.write.facade"
import { colorLabelsSelector } from "../selectors/labelSettings.selectors"

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
