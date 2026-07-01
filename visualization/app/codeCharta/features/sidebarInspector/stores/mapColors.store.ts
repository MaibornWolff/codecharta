import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { mapColorsSelector } from "../../../appearance/appearance.facade"

@Injectable({
    providedIn: "root"
})
export class InspectorMapColorsStore {
    constructor(private readonly store: Store<CcState>) {}

    mapColors$ = this.store.select(mapColorsSelector)
}
