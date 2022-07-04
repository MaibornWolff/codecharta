import "./filePanel.component.scss"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { removeFile, setDeltaByNames, setStandardByNames } from "../../state/store/files/files.actions"
import { FilesSelectionSubscriber, FilesService } from "../../state/store/files/files.service"
import { fileStatesAvailable, getFileNameOf, getVisibleFileStates, isDeltaState, isPartialState } from "../../model/files/files.helper"
import { FileSelectionState, FileState } from "../../model/files/files"
import { CodeChartaService } from "../../codeCharta.service"
import { removeRecentFile } from "../../state/store/dynamicSettings/recentFiles/recentFiles.actions"

// Todo:
// - remove recentFiles from Store, as it can be derived from files
// - apply partial selection only when at least one is selected

interface SelectedFileNames {
	delta: {
		reference: string
		comparison: string
	}
	partial: string[]
}

export class FilePanelController implements FilesSelectionSubscriber {
	private lastRenderState: FileSelectionState

	private _viewModel: {
		isPartialState: boolean
		isDeltaState: boolean
		files: FileState[]
		renderState: FileSelectionState
		selectedFileNames: SelectedFileNames
	} = {
		isPartialState: null,
		isDeltaState: null,
		files: null,
		renderState: null,
		selectedFileNames: {
			delta: {
				reference: null,
				comparison: null
			},
			partial: []
		}
	}

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		FilesService.subscribe(this.$rootScope, this)
	}

	onRemoveFile = (filename: string, $event): void => {
		this.storeService.dispatch(removeFile(filename))
		this.storeService.dispatch(removeRecentFile(filename))

		const files = this.storeService.getState().files
		this.partialStateFileRemove(files)

		$event.stopPropagation()
		$event.preventDefault()
	}

	private partialStateFileRemove(files: FileState[]) {
		const selectedFiles = files.filter(x => x.selectedAs === FileSelectionState.Partial).map(fileState => getFileNameOf(fileState))
		if (selectedFiles.length > 0) {
			this.onPartialFilesChange(selectedFiles)
		} else {
			this.onPartialFilesChange([getFileNameOf(files[files.length - 1])])
		}
	}

	onFilesSelectionChanged(files: FileState[]) {
		this._viewModel.files = files
		this._viewModel.isPartialState = isPartialState(files)
		this._viewModel.isDeltaState = isDeltaState(files)
		this.updateSelectedFileNamesInViewModel()
		this.lastRenderState = this._viewModel.renderState
	}

	onPartialSelectionClosed = () => {
		this.updateSelectedFileNamesInViewModel()
	}

	private updateSelectedFileNamesInViewModel() {
		const visibleFileStates = getVisibleFileStates(this._viewModel.files)

		if (this._viewModel.isDeltaState) {
			this._viewModel.renderState = FileSelectionState.Comparison

			let reference = visibleFileStates[0].file.fileMeta.fileName
			let comparison = visibleFileStates[visibleFileStates.length - 1].file.fileMeta.fileName
			if (visibleFileStates[0].selectedAs === FileSelectionState.Comparison) {
				const temporary = comparison
				comparison = reference
				reference = temporary
			}
			this._viewModel.selectedFileNames.delta.reference = reference
			this._viewModel.selectedFileNames.delta.comparison = comparison
		} else {
			this._viewModel.renderState = FileSelectionState.Partial
			this._viewModel.selectedFileNames.partial = visibleFileStates.map(x => x.file.fileMeta.fileName)
		}
	}

	onDeltaReferenceFileChange = (referenceFileName: string) => {
		const rootFile = this._viewModel.files.find(x => x.file.fileMeta.fileName === referenceFileName)
		if (!rootFile) {
			return
		}
		const rootName = rootFile.file.map.name
		CodeChartaService.updateRootData(rootName)
		this.storeService.dispatch(setDeltaByNames(referenceFileName, this._viewModel.selectedFileNames.delta.comparison))
	}

	onDeltaComparisonFileChange = (comparisonFileName: string) => {
		const referenceFileName = this._viewModel.selectedFileNames.delta.reference
		const rootName = this._viewModel.files.find(x => x.file.fileMeta.fileName === referenceFileName).file.map.name
		CodeChartaService.updateRootData(rootName)
		this.storeService.dispatch(setDeltaByNames(referenceFileName, comparisonFileName))
	}

	onPartialFilesChange = (partialFileNames: string[]) => {
		if (partialFileNames.length > 0) {
			this.storeService.dispatch(setStandardByNames(partialFileNames))
		} else {
			this._viewModel.selectedFileNames.partial = []
		}
	}

	onDeltaStateSelected = () => {
		this._viewModel.selectedFileNames.delta.reference = this.getLastVisibleFileName()
		this.onDeltaComparisonFileChange(null)
	}

	selectAllPartialFiles = () => {
		const allFileNames = this._viewModel.files.map(x => x.file.fileMeta.fileName)
		this.onPartialFilesChange(allFileNames)
	}

	selectRecentPartialFiles = () => {
		const recentFileNames = this.storeService.getState().dynamicSettings.recentFiles
		if (recentFileNames.length > 0) {
			this.onPartialFilesChange(recentFileNames)
		} else {
			this.selectAllPartialFiles()
		}
	}

	selectZeroPartialFiles = () => {
		this.onPartialFilesChange([])
	}

	invertPartialFileSelection = () => {
		const invertedFileNames: string[] = []
		const partialFileNames = new Set(this._viewModel.selectedFileNames.partial)

		for (const {
			file: {
				fileMeta: { fileName }
			}
		} of this._viewModel.files) {
			if (!partialFileNames.has(fileName)) {
				invertedFileNames.push(fileName)
			}
		}

		this.onPartialFilesChange(invertedFileNames)
	}

	private getLastVisibleFileName() {
		if (this.lastRenderState === FileSelectionState.Partial) {
			const visibleFileStates = getVisibleFileStates(this._viewModel.files)
			if (fileStatesAvailable(this._viewModel.files)) {
				return visibleFileStates[0].file.fileMeta.fileName
			}
			return this._viewModel.files[0].file.fileMeta.fileName
		}
		if (this.lastRenderState === FileSelectionState.Comparison) {
			return this._viewModel.selectedFileNames.delta.reference
		}
	}
}

export const filePanelComponent = {
	selector: "ccFilePanel",
	template: require("./filePanel.component.html"),
	controller: FilePanelController
}
