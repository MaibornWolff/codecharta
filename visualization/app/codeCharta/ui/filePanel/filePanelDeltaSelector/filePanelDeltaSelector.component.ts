import { Component, Inject } from "@angular/core"
import { map } from "rxjs"
import { CCFile } from "../../../codeCharta.model"
import { FileSelectionState } from "../../../model/files/files"
import { Store } from "../../../state/angular-redux/store"
import { setDeltaComparison, setDeltaReference } from "../../../state/store/files/files.actions"
import { filesSelector } from "../../../state/store/files/files.selector"
import { pictogramBackgroundSelector } from "./pictogramBackground.selector"

@Component({
	selector: "cc-file-panel-delta-selector",
	template: require("./filePanelDeltaSelector.component.html")
})
export class FilePanelDeltaSelectorComponent {
	files$ = this.store.select(filesSelector)
	referenceFile$ = this.files$.pipe(map(files => files.find(file => file.selectedAs === FileSelectionState.Reference)?.file))
	comparisonFile$ = this.files$.pipe(map(files => files.find(file => file.selectedAs === FileSelectionState.Comparison)?.file))
	pictogramBackground$ = this.store.select(pictogramBackgroundSelector)

	constructor(@Inject(Store) private store: Store) {}

	handleDeltaReferenceFileChange(file: CCFile) {
		this.store.dispatch(setDeltaReference(file))
	}

	handleDeltaComparisonFileChange(file: CCFile) {
		this.store.dispatch(setDeltaComparison(file))
	}
}
