import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { colorRangeSelector } from "../../../state/store/dynamicSettings/colorRange/colorRange.selector"

@Injectable({
    providedIn: "root"
})
export class LegendColorRangeStore {
    constructor(private readonly store: Store<CcState>) {}

    colorRange$ = this.store.select(colorRangeSelector)
}
