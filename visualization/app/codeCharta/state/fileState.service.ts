import { CCFile, FileSelectionState, FileState } from "../model/codeCharta.model"
import { IRootScopeService } from "angular"
import { LoadingStatusService } from "./loadingStatus.service"
import _ from "lodash"
import { FileStateHelper } from "../util/fileStateHelper"

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

	public setSingleByName(fileName: string) {
		const singleFile: CCFile = FileStateHelper.getFileByFileName(fileName, this.fileStates)
		this.setSingle(singleFile)
	}

	public setSingle(file: CCFile) {
		this.resetSelectionStates()
		const matchedFile = this.fileStates.find(x => x.file === file)
		if (matchedFile) {
			matchedFile.selectedAs = FileSelectionState.Single
		}
		this.notifySelectionChange()
	}

	public setDeltaByNames(referenceFileName: string, comparisonFileName: string) {
		const referenceFile: CCFile = FileStateHelper.getFileByFileName(referenceFileName, this.fileStates)
		const comparisonFile: CCFile = FileStateHelper.getFileByFileName(comparisonFileName, this.fileStates)
		this.setDelta(referenceFile, comparisonFile)
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

	public setMultipleByNames(partialFileNames: string[]) {
		const partialFiles: CCFile[] = []
		partialFileNames.forEach(fileName => partialFiles.push(FileStateHelper.getFileByFileName(fileName, this.fileStates)))
		this.setMultiple(partialFiles)
	}

	public setMultiple(multipleFiles: CCFile[]) {
		this.resetSelectionStates()
		this.fileStates.filter(x => multipleFiles.indexOf(x.file) !== -1).forEach(x => (x.selectedAs = FileSelectionState.Partial))
		this.notifySelectionChange()
	}

	public fileStatesAvailable(): boolean {
		return this.fileStates.length > 0
	}

	public isDeltaState(): boolean {
		return FileStateHelper.isDeltaState(this.fileStates)
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
