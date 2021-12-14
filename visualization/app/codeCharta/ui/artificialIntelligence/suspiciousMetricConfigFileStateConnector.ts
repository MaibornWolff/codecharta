"use strict"
import { FileSelectionState, FileState } from "../../model/files/files"
import { SuspiciousMetricConfigMapSelectionMode } from "./suspiciousMetricConfig.api.model"

export class SuspiciousMetricConfigFileStateConnector {
	private readonly files: FileState[] = []
	private fileNameParts: string[] = []
	private mapChecksums: string[] = []
	private stateSetting
	private mapSelectionMode: SuspiciousMetricConfigMapSelectionMode = SuspiciousMetricConfigMapSelectionMode.SINGLE

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

	private setMapSelectionMode(fileSelectionState: string) {
		if (fileSelectionState === FileSelectionState.Partial) {
			this.mapSelectionMode = SuspiciousMetricConfigMapSelectionMode.MULTIPLE
		} else if (fileSelectionState === FileSelectionState.Comparison || fileSelectionState === FileSelectionState.Reference) {
			this.mapSelectionMode = SuspiciousMetricConfigMapSelectionMode.DELTA
		}
	}

	getMapSelectionMode(): SuspiciousMetricConfigMapSelectionMode {
		return this.mapSelectionMode
	}

	getChecksumOfAssignedMaps(): string {
		return this.mapChecksums.join(";")
	}

	getStateSetting() {
		return this.stateSetting
	}
}
