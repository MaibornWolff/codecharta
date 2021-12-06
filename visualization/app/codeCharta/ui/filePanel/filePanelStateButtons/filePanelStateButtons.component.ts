import { Component, Input } from "@angular/core"
import { FilePanelState } from "../filePanel.component"
import { StoreService } from "../../../state/store.service"
import { ISelectedFileNameListComponent } from "./ISelectedFileNameList.component"
import { FileSelectionState, FileState } from "../../../model/files/files"
import { CodeChartaService } from "../../../codeCharta.service"
import { setDeltaByNames } from "../../../state/store/files/files.actions"
import { fileStatesAvailable, getVisibleFileStates } from "../../../model/files/files.helper"

@Component({
	selector: "cc-file-panel-state-buttons",
	template: require("./filePanelStateButtons.component.html")
})
export class FilePanelStateButtonsComponent {
	@Input() state: FilePanelState
	private lastRenderState: FileSelectionState
	private selectedFileNames: ISelectedFileNameListComponent
	private files: FileState[]

	constructor(private storeService: StoreService) {}

	onDeltaComparisonFileChange(comparisonFileName: string) {
		const referenceFileName = this.selectedFileNames.delta.reference
		const rootName = this.files.find(x => x.file.fileMeta.fileName === referenceFileName).file.map.name
		CodeChartaService.updateRootData(rootName)
		this.storeService.dispatch(setDeltaByNames(referenceFileName, comparisonFileName))
	}

	onStandardStateSelected() {
		// eslint-disable-next-line no-console
		console.log("this is standard")
	}

	onDeltaStateSelected() {
		// eslint-disable-next-line no-console
		console.log("this is delta")
		this.selectedFileNames.delta.reference = this.getLastVisibleFileName()
		this.onDeltaComparisonFileChange(null)
	}

	private getLastVisibleFileName() {
		if (this.lastRenderState === FileSelectionState.Single) {
			return this.selectedFileNames.single
		}
		if (this.lastRenderState === FileSelectionState.Partial) {
			const visibleFileStates = getVisibleFileStates(this.files)
			if (fileStatesAvailable(this.files)) {
				return visibleFileStates[0].file.fileMeta.fileName
			}
			return this.files[0].file.fileMeta.fileName
		}
		if (this.lastRenderState === FileSelectionState.Comparison) {
			return this.selectedFileNames.delta.reference
		}
	}
}
