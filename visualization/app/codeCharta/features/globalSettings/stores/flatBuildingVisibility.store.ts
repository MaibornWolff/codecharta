import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { hideFlatBuildingsSelector } from "../selectors/globalSettings.selectors"
import { setHideFlatBuildings } from "../../../state/store/appSettings/hideFlatBuildings/hideFlatBuildings.actions"

/**
 * Store for flat building visibility settings.
 * This is the ONLY place that injects Store for flat building visibility.
 */
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
