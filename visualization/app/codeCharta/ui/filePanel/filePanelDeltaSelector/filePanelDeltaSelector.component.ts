import { Component, Inject, OnInit } from "@angular/core"
import { map } from "rxjs"
import { CCFile } from "../../../codeCharta.model"
import { FileSelectionState } from "../../../model/files/files"
import { Store } from "../../../state/angular-redux/store"
import { referenceFileSelector } from "../../../state/selectors/referenceFile/referenceFile.selector"
import { setDelta, setDeltaComparison, setDeltaReference } from "../../../state/store/files/files.actions"
import { filesSelector } from "../../../state/store/files/files.selector"
import { pictogramBackgroundSelector } from "./pictogramBackground.selector"

@Component({
	selector: "cc-file-panel-delta-selector",
	template: require("./filePanelDeltaSelector.component.html")
})
export class FilePanelDeltaSelectorComponent implements OnInit {
	files$ = this.store.select(filesSelector)
	referenceFile$ = this.store.select(referenceFileSelector)
	comparisonFile$ = this.files$.pipe(map(files => files.find(file => file.selectedAs === FileSelectionState.Comparison)?.file))
	possibleComparisonFiles$ = this.files$.pipe(map(files => files.filter(file => file.selectedAs !== FileSelectionState.Reference)))
	pictogramBackground$ = this.store.select(pictogramBackgroundSelector)
	reference: CCFile
	comparison: CCFile

	constructor(@Inject(Store) private store: Store) {}

	ngOnInit(): void {
		this.referenceFile$.subscribe(file => (this.reference = file))
		this.comparisonFile$.subscribe(file => (this.comparison = file))
	}

	handleDeltaReferenceFileChange(file: CCFile) {
		this.store.dispatch(setDeltaReference(file))
	}

	handleDeltaComparisonFileChange(file: CCFile) {
		this.store.dispatch(setDeltaComparison(file))
	}

	exchangeFiles() {
		this.store.dispatch(setDelta(this.comparison, this.reference))
	}
}
