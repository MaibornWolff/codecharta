import { Component } from "@angular/core"
import { Store } from "@ngrx/store"
import { LayoutAlgorithm, CcState } from "../../../../../codeCharta.model"
import { setLayoutAlgorithm } from "../../../../../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.actions"
import { layoutAlgorithmSelector } from "../../../../../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.selector"
import { setMaxTreeMapFiles } from "../../../../../state/store/appSettings/maxTreeMapFiles/maxTreeMapFiles.actions"
import { maxTreeMapFilesSelector } from "../../../../../state/store/appSettings/maxTreeMapFiles/maxTreeMapFiles.selector"
import { debounce } from "../../../../../util/debounce"

@Component({
    selector: "cc-map-layout-selection",
    templateUrl: "./mapLayoutSelection.component.html"
})
export class MapLayoutSelectionComponent {
    layoutAlgorithms = Object.values(LayoutAlgorithm)
    layoutAlgorithm$ = this.store.select(layoutAlgorithmSelector)
    maxTreeMapFiles$ = this.store.select(maxTreeMapFilesSelector)

    constructor(private store: Store<CcState>) {}

    handleSelectedLayoutAlgorithmChanged(event: { value: LayoutAlgorithm }) {
        this.store.dispatch(setLayoutAlgorithm({ value: event.value }))
    }

    handleChangeMaxTreeMapFiles = debounce((maxTreeMapFiles: number) => {
        this.store.dispatch(setMaxTreeMapFiles({ value: maxTreeMapFiles }))
    }, 400)
}
