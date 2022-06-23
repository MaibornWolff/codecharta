import { Component, Input } from "@angular/core"
import { FileState } from "../../../model/files/files"

@Component({
	selector: "cc-file-panel-delta-selector",
	template: require("./filePanelDeltaSelector.component.html")
})
export class FilePanelDeltaSelectorComponent {
	@Input() files: FileState[]
	@Input() pictogramUpperColor: string
	@Input() pictogramLowerColor: string
	@Input() handleDeltaReferenceFileChange: (referenceFileName: string) => void
	@Input() handleDeltaComparisonFileChange: (comparisonFileName: string) => void

	selectedDeltaReferenceFile: string
	selectedDeltaComparisonFile: string
}
