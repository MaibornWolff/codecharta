"use strict"
import { FileSelectionState, FileState } from "../../model/files/files"
import { CustomViewMapSelectionMode } from "../../model/customView/customView.api.model"

export class CustomViewFileStateConnector {
	private readonly files: FileState[] = []
	private fileNameParts: string[] = []
	private mapChecksums: string[] = []
	private mapSelectionMode: CustomViewMapSelectionMode = CustomViewMapSelectionMode.SINGLE

	constructor(files: FileState[]) {
		this.files = files

		if (typeof this.files !== "undefined") {
			this.processFiles()
		}
	}

	private processFiles() {
		for (const file of this.files) {
			if (file.selectedAs !== FileSelectionState.None) {
				this.setMapSelectionMode(file.selectedAs)
				this.mapChecksums.push(file.file.fileMeta.fileChecksum)
				this.fileNameParts.push(file.file.fileMeta.fileName)
			}
		}
	}

	getSelectedMaps(): string[] {
		return this.fileNameParts
	}

	getJointMapName(): string {
		return this.fileNameParts.join(" ")
	}

	private setMapSelectionMode(fileSelectionState: string) {
		if (fileSelectionState === FileSelectionState.Partial) {
			this.mapSelectionMode = CustomViewMapSelectionMode.MULTIPLE
		} else if (fileSelectionState === FileSelectionState.Comparison || fileSelectionState === FileSelectionState.Reference) {
			this.mapSelectionMode = CustomViewMapSelectionMode.DELTA
		}
	}

	getMapSelectionMode(): CustomViewMapSelectionMode {
		return this.mapSelectionMode
	}

	getChecksumOfAssignedMaps(): string {
		return this.mapChecksums.join(";")
	}
}
