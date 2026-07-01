import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { hideFlatBuildingsSelector } from "../selectors/globalSettings.selectors"
import { setHideFlatBuildings } from "../../../appearance/appearance.facade"

@Injectable({
    providedIn: "root"
})
export class FlatBuildingVisibilityStore {
    constructor(private readonly store: Store<CcState>) {}

    hideFlatBuildings$ = this.store.select(hideFlatBuildingsSelector)

    setHideFlatBuildings(value: boolean) {
        this.store.dispatch(setHideFlatBuildings({ value }))
    }
}
