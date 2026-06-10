import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { mapColorsSelector } from "../selectors/edgeAndColors.selectors"
import { invertColorRange, invertDeltaColors } from "../../../state/store/appSettings/mapColors/mapColors.actions"

@Injectable({
    providedIn: "root"
})
export class MapColorsStore {
    constructor(private readonly store: Store<CcState>) {}

    mapColors$ = this.store.select(mapColorsSelector)

    invertColorRange() {
        this.store.dispatch(invertColorRange())
    }

    invertDeltaColors() {
        this.store.dispatch(invertDeltaColors())
    }
}
