import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { hideFlatBuildingsSelector } from "../../../stores/mapState/mapState.read.facade"
import { setHideFlatBuildings } from "../../../stores/mapState/mapState.write.facade"

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
