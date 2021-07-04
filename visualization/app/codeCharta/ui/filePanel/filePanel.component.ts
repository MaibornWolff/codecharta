import "./filePanel.component.scss"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { removeFile, setDeltaByNames, setMultipleByNames, setSingleByName } from "../../state/store/files/files.actions"
import { FilesSelectionSubscriber, FilesService } from "../../state/store/files/files.service"
import {
	fileStatesAvailable,
	getFileNameOf,
	getVisibleFileStates,
	isDeltaState,
	isPartialState,
	isSingleState
} from "../../model/files/files.helper"
import { FileSelectionState, FileState } from "../../model/files/files"
import { CodeChartaService } from "../../codeCharta.service"
import { removeRecentFile } from "../../state/store/dynamicSettings/recentFiles/recentFiles.actions"

interface SelectedFileNames {
	single: string
	delta: {
		reference: string
		comparison: string
	}
	partial: string[]
}

export class FilePanelController implements FilesSelectionSubscriber {
	private lastRenderState: FileSelectionState

	private _viewModel: {
		isSingleState: boolean
		isPartialState: boolean
		isDeltaState: boolean
		files: FileState[]
		renderState: FileSelectionState
		selectedFileNames: SelectedFileNames
		pictogramFirstFileColor: string
		pictogramUpperColor: string
		pictogramLowerColor: string
	} = {
		isSingleState: null,
		isPartialState: null,
		isDeltaState: null,
		files: null,
		renderState: null,
		selectedFileNames: {
			single: null,
			delta: {
				reference: null,
				comparison: null
			},
			partial: []
		},
		pictogramFirstFileColor: null,
		pictogramUpperColor: null,
		pictogramLowerColor: null
	}

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		FilesService.subscribe(this.$rootScope, this)
	}

	onRemoveFile(filename, state, $event): void {
		this.storeService.dispatch(removeFile(filename))
		this.storeService.dispatch(removeRecentFile(filename))

		const files = this.storeService.getState().files
		if (state === FileSelectionState.Single) {
			this.singleStateFileRemove(files)
		} else {
			this.partialStateFileRemove(files)
		}

		$event.stopPropagation()
		$event.preventDefault()
	}

	singleStateFileRemove(files: FileState[]) {
		if (!isSingleState(files)) {
			this.selectRemainingFile(files)
		} else {
			this.keepSelection()
		}
	}

	private keepSelection() {
		const selectedFile = this.storeService.getState().files.find(fileState => fileState.selectedAs === FileSelectionState.Single)
		this.onSingleFileChange(getFileNameOf(selectedFile))
	}

	private selectRemainingFile(files: FileState[]) {
		const remainingFile = files[files.length - 1]
		this.onSingleFileChange(getFileNameOf(remainingFile))
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
		this._viewModel.isSingleState = isSingleState(files)
		this._viewModel.isPartialState = isPartialState(files)
		this._viewModel.isDeltaState = isDeltaState(files)
		this.setPictogramColor()
		this.updateSelectedFileNamesInViewModel()
		this.lastRenderState = this._viewModel.renderState
	}

	onPartialSelectionClosed() {
		this.updateSelectedFileNamesInViewModel()
	}

	private setPictogramColor() {
		this._viewModel.pictogramFirstFileColor = "#808080"
		this._viewModel.pictogramUpperColor = this.storeService.getState().appSettings.mapColors.positiveDelta
		this._viewModel.pictogramLowerColor = this.storeService.getState().appSettings.mapColors.negativeDelta
	}

	private updateSelectedFileNamesInViewModel() {
		const visibleFileStates = getVisibleFileStates(this._viewModel.files)

		if (this._viewModel.isSingleState) {
			this._viewModel.renderState = FileSelectionState.Single
			this._viewModel.selectedFileNames.single = visibleFileStates[0].file.fileMeta.fileName
		} else if (this._viewModel.isDeltaState) {
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

	onSingleFileChange(singleFileName: string) {
		this.storeService.dispatch(setSingleByName(singleFileName))
		const rootName = this._viewModel.files.find(x => x.selectedAs === FileSelectionState.Single).file.map.name
		CodeChartaService.updateRootData(rootName)
	}

	onDeltaReferenceFileChange(referenceFileName: string) {
		const rootName = this._viewModel.files.find(x => x.file.fileMeta.fileName === referenceFileName).file.map.name
		CodeChartaService.updateRootData(rootName)
		this.storeService.dispatch(setDeltaByNames(referenceFileName, this._viewModel.selectedFileNames.delta.comparison))
	}

	onDeltaComparisonFileChange(comparisonFileName: string) {
		const referenceFileName = this._viewModel.selectedFileNames.delta.reference
		const rootName = this._viewModel.files.find(x => x.file.fileMeta.fileName === referenceFileName).file.map.name
		CodeChartaService.updateRootData(rootName)
		this.storeService.dispatch(setDeltaByNames(referenceFileName, comparisonFileName))
	}

	onPartialFilesChange(partialFileNames: string[]) {
		if (partialFileNames.length > 0) {
			this.storeService.dispatch(setMultipleByNames(partialFileNames))
		} else {
			this._viewModel.selectedFileNames.partial = []
		}
	}

	onSingleStateSelected() {
		this._viewModel.selectedFileNames.single = this.getLastVisibleFileName()
		this.onSingleFileChange(this._viewModel.selectedFileNames.single)
	}

	onPartialStateSelected() {
		this.selectRecentPartialFiles()
	}

	onDeltaStateSelected() {
		this._viewModel.selectedFileNames.delta.reference = this.getLastVisibleFileName()
		this.onDeltaComparisonFileChange(null)
	}

	selectAllPartialFiles() {
		const allFileNames = this._viewModel.files.map(x => x.file.fileMeta.fileName)
		this.onPartialFilesChange(allFileNames)
	}

	selectRecentPartialFiles() {
		const recentFileNames = this.storeService.getState().dynamicSettings.recentFiles
		if (recentFileNames.length > 0) {
			this.onPartialFilesChange(recentFileNames)
		} else {
			this.selectAllPartialFiles()
		}
	}

	selectZeroPartialFiles() {
		this.onPartialFilesChange([])
	}

	invertPartialFileSelection() {
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
		if (this.lastRenderState === FileSelectionState.Single) {
			return this._viewModel.selectedFileNames.single
		}
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
	selector: "filePanelComponent",
	template: require("./filePanel.component.html"),
	controller: FilePanelController
}
