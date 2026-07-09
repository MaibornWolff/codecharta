import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, LayoutAlgorithm } from "../../../model/codeCharta.model"
import { setLayoutAlgorithm } from "../../../stores/mapState/mapState.write.facade"
import { setMaxTreeMapFiles } from "../../../stores/preferences/preferences.write.facade"
import { layoutAlgorithmSelector, maxTreeMapFilesSelector } from "../selectors/globalSettings.selectors"

@Injectable({
    providedIn: "root"
})
export class MapLayoutStore {
    constructor(private readonly store: Store<CcState>) {}

    layoutAlgorithm$ = this.store.select(layoutAlgorithmSelector)
    maxTreeMapFiles$ = this.store.select(maxTreeMapFilesSelector)

    setLayoutAlgorithm(value: LayoutAlgorithm) {
        this.store.dispatch(setLayoutAlgorithm({ value }))
    }

    setMaxTreeMapFiles(value: number) {
        this.store.dispatch(setMaxTreeMapFiles({ value }))
    }
}
