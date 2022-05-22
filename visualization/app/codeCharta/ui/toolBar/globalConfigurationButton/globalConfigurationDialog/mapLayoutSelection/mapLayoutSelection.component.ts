import { Component, Inject } from "@angular/core"
import { MatSelectChange } from "@angular/material/select"
import { LayoutAlgorithm } from "../../../../../codeCharta.model"
import { Store } from "../../../../../state/angular-redux/store"
import { setLayoutAlgorithm } from "../../../../../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.actions"
import { layoutAlgorithmSelector } from "../../../../../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.selector"
import { setMaxTreeMapFiles } from "../../../../../state/store/appSettings/maxTreeMapFiles/maxTreeMapFiles.actions"
import { maxTreeMapFilesSelector } from "../../../../../state/store/appSettings/maxTreeMapFiles/maxTreeMapFiles.selector"
import debounce from "lodash.debounce"

@Component({
	selector: "cc-map-layout-selection",
	template: require("./mapLayoutSelection.component.html")
})
export class MapLayoutSelectionComponent {
	layoutAlgorithms = Object.values(LayoutAlgorithm)
	layoutAlgorithm$ = this.store.select(layoutAlgorithmSelector)
	maxTreeMapFiles$ = this.store.select(maxTreeMapFilesSelector)

	constructor(@Inject(Store) private store: Store) {}

	handleSelectedLayoutAlgorithmChanged(event: MatSelectChange) {
		this.store.dispatch(setLayoutAlgorithm(event.value))
	}

	handleChangeMaxTreeMapFiles = debounce((maxTreeMapFiles: number) => {
		this.store.dispatch(setMaxTreeMapFiles(maxTreeMapFiles))
	}, 400)
}
