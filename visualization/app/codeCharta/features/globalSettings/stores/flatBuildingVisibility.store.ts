import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { setHideFlatBuildings } from "../../../stores/mapState/mapState.write.facade"
import { hideFlatBuildingsSelector } from "../selectors/globalSettings.selectors"

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
