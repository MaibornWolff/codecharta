import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { mapColorsSelector } from "../../../state/store/appSettings/mapColors/mapColors.selector"

@Injectable({
    providedIn: "root"
})
export class LegendMapColorsStore {
    constructor(private readonly store: Store<CcState>) {}

    mapColors$ = this.store.select(mapColorsSelector)
}
