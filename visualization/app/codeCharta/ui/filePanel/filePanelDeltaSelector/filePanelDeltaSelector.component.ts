import { Component, Inject, Input } from "@angular/core"
import { FileState } from "../../../model/files/files"
import { Store } from "../../../state/angular-redux/store"
import { pictogramBackgroundSelector } from "./pictogramBackground.selector"

@Component({
	selector: "cc-file-panel-delta-selector",
	template: require("./filePanelDeltaSelector.component.html")
})
export class FilePanelDeltaSelectorComponent {
	@Input() files: FileState[]
	@Input() handleDeltaReferenceFileChange: (referenceFileName: string) => void
	@Input() handleDeltaComparisonFileChange: (comparisonFileName: string) => void

	pictogramBackground$ = this.store.select(pictogramBackgroundSelector)

	constructor(@Inject(Store) private store: Store) {}

	selectedDeltaReferenceFile: string
	selectedDeltaComparisonFile: string
}
