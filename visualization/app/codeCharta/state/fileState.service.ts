import { CCFile, FileSelectionState, FileState } from "../codeCharta.model"
import { IRootScopeService } from "angular"
import { LoadingStatusService } from "./loadingStatus.service"

export interface FileStateSubscriber {
	onFileStatesChanged(fileStates: FileState[])
}

export class FileStateService {
	private static FILE_STATE_CHANGED_EVENT = "file-states-changed"

	private fileStates: Array<FileState> = []

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private loadingStatusService: LoadingStatusService) {}

	public resetMaps() {
		this.fileStates = []
	}

	public addFile(file: CCFile) {
		this.fileStates.push({ file: file, selectedAs: FileSelectionState.None })
	}

	public getCCFiles(): CCFile[] {
		return this.fileStates.map(x => x.file)
	}

	public getFileStates(): FileState[] {
		return this.fileStates
	}

	public setSingle(file: CCFile) {
		this.resetSelectionStates()
		const matchedFile = this.fileStates.find(x => x.file === file)
		if (matchedFile) {
			matchedFile.selectedAs = FileSelectionState.Single
		}
		this.notifySelectionChange()
	}

	public setDelta(reference: CCFile, comparison: CCFile) {
		this.resetSelectionStates()
		const matchedReferenceFile = this.fileStates.find(x => x.file === reference)
		const matchedComparisonFile = this.fileStates.find(x => x.file === comparison)

		if (matchedReferenceFile) {
			matchedReferenceFile.selectedAs = FileSelectionState.Reference
		}

		if (matchedComparisonFile) {
			matchedComparisonFile.selectedAs = FileSelectionState.Comparison
		}
		this.notifySelectionChange()
	}

	public setMultiple(multipleFiles: CCFile[]) {
		this.resetSelectionStates()
		this.fileStates.filter(x => multipleFiles.indexOf(x.file) !== -1).forEach(x => (x.selectedAs = FileSelectionState.Partial))
		this.notifySelectionChange()
	}

	private resetSelectionStates() {
		this.fileStates.forEach(file => (file.selectedAs = FileSelectionState.None))
	}

	private notifySelectionChange() {
		this.loadingStatusService.updateLoadingMapFlag(true)
		this.$rootScope.$broadcast(FileStateService.FILE_STATE_CHANGED_EVENT, this.fileStates)
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: FileStateSubscriber) {
		$rootScope.$on(FileStateService.FILE_STATE_CHANGED_EVENT, (event, data) => {
			subscriber.onFileStatesChanged(data)
		})
	}
}
