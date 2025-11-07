import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, LayoutAlgorithm } from "../../../codeCharta.model"
import { layoutAlgorithmSelector, maxTreeMapFilesSelector } from "../selectors/globalSettings.selectors"
import { setLayoutAlgorithm } from "../../../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.actions"
import { setMaxTreeMapFiles } from "../../../state/store/appSettings/maxTreeMapFiles/maxTreeMapFiles.actions"

/**
 * Store for map layout settings.
 * This is the ONLY place that injects Store for map layout.
 */
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
