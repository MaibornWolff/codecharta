import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, MapColors } from "../../../codeCharta.model"
import { mapColorsSelector } from "../selectors/edgeAndColors.selectors"
import { invertColorRange, invertDeltaColors, setMapColors } from "../../../appearance/appearance.facade"

@Injectable({
    providedIn: "root"
})
export class MapColorsStore {
    constructor(private readonly store: Store<CcState>) {}

    mapColors$ = this.store.select(mapColorsSelector)

    setMapColors(value: Partial<MapColors>) {
        this.store.dispatch(setMapColors({ value }))
    }

    invertColorRange() {
        this.store.dispatch(invertColorRange())
    }

    invertDeltaColors() {
        this.store.dispatch(invertDeltaColors())
    }
}
