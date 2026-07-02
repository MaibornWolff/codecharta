import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { showOnlyBuildingsWithEdgesSelector } from "../selectors/edgeAndColors.selectors"
import { setShowOnlyBuildingsWithEdges } from "../../../mapState/mapState.facade"

@Injectable({
    providedIn: "root"
})
export class ShowOnlyBuildingsWithEdgesStore {
    constructor(private readonly store: Store<CcState>) {}

    showOnlyBuildingsWithEdges$ = this.store.select(showOnlyBuildingsWithEdgesSelector)

    setShowOnlyBuildingsWithEdges(value: boolean) {
        this.store.dispatch(setShowOnlyBuildingsWithEdges({ value }))
    }
}
