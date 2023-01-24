import { Component, Inject, ViewEncapsulation } from "@angular/core"
import { map } from "rxjs"
import { CCFile } from "../../../codeCharta.model"
import { FileSelectionState } from "../../../model/files/files"
import { Store } from "../../../state/angular-redux/store"
import { referenceFileSelector } from "../../../state/selectors/referenceFile/referenceFile.selector"
import { setDeltaComparison, setDeltaReference, switchReferenceAndComparison } from "../../../state/store/files/files.actions"
import { filesSelector } from "../../../state/store/files/files.selector"
import { pictogramBackgroundSelector } from "./pictogramBackground.selector"

@Component({
	selector: "cc-file-panel-delta-selector",
	templateUrl: "./filePanelDeltaSelector.component.html",
	encapsulation: ViewEncapsulation.None
})
export class FilePanelDeltaSelectorComponent {
	files$ = this.store.select(filesSelector)
	referenceFile$ = this.store.select(referenceFileSelector)
	comparisonFile$ = this.files$.pipe(map(files => files.find(file => file.selectedAs === FileSelectionState.Comparison)?.file))
	possibleComparisonFiles$ = this.files$.pipe(map(files => files.filter(file => file.selectedAs !== FileSelectionState.Reference)))
	pictogramBackground$ = this.store.select(pictogramBackgroundSelector)

	constructor(@Inject(Store) private store: Store) {}

	handleDeltaReferenceFileChange(file: CCFile) {
		this.store.dispatch(setDeltaReference(file))
	}

	handleDeltaComparisonFileChange(file: CCFile) {
		this.store.dispatch(setDeltaComparison(file))
	}

	switchReferenceAndComparison() {
		this.store.dispatch(switchReferenceAndComparison())
	}
}
