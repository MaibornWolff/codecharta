import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { setShowOnlyBuildingsWithEdges } from "../../../stores/mapState/mapState.write.facade"
import { showOnlyBuildingsWithEdgesSelector } from "../selectors/edgeAndColors.selectors"

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
