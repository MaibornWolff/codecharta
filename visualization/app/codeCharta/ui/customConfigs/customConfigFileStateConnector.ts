"use strict"
import { FileSelectionState, FileState } from "../../model/files/files"
import { CustomConfigMapSelectionMode } from "../../model/customConfig/customConfig.api.model"

export class CustomConfigFileStateConnector {
	private readonly files: FileState[] = []
	private fileNameParts: string[] = []
	private mapChecksums: string[] = []
	private mapSelectionMode: CustomConfigMapSelectionMode = CustomConfigMapSelectionMode.SINGLE

	constructor(files: FileState[]) {
		this.files = files

		if (this.files !== undefined) {
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
			this.mapSelectionMode = CustomConfigMapSelectionMode.MULTIPLE
		} else if (fileSelectionState === FileSelectionState.Comparison || fileSelectionState === FileSelectionState.Reference) {
			this.mapSelectionMode = CustomConfigMapSelectionMode.DELTA
		}
	}

	getMapSelectionMode(): CustomConfigMapSelectionMode {
		return this.mapSelectionMode
	}

	isDeltaMode(): boolean {
		return this.mapSelectionMode === CustomConfigMapSelectionMode.DELTA
	}

	getChecksumOfAssignedMaps(): string {
		return this.mapChecksums.join(";")
	}

	isMapAssigned(checksum: string) {
		return this.mapChecksums.includes(checksum)
	}

	getAmountOfUploadedFiles(): number {
		return this.files.length
	}

	isEachFileSelected(): boolean {
		return this.files.length === this.getSelectedMaps().length
	}
}
