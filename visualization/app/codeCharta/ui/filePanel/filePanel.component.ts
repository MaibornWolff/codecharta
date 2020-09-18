import "./filePanel.component.scss"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { setDeltaByNames, setMultipleByNames, setSingleByName } from "../../state/store/files/files.actions"
import { FilesSelectionSubscriber, FilesService } from "../../state/store/files/files.service"
import { fileStatesAvailable, getVisibleFileStates, isDeltaState, isPartialState, isSingleState } from "../../model/files/files.helper"
import { FileSelectionState, FileState } from "../../model/files/files"

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

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		FilesService.subscribe(this.$rootScope, this)
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
				const temp = comparison
				comparison = reference
				reference = temp
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
	}

	onDeltaReferenceFileChange(referenceFileName: string) {
		this.storeService.dispatch(setDeltaByNames(referenceFileName, this._viewModel.selectedFileNames.delta.comparison))
	}

	onDeltaComparisonFileChange(comparisonFileName: string) {
		this.storeService.dispatch(setDeltaByNames(this._viewModel.selectedFileNames.delta.reference, comparisonFileName))
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
		this.selectAllPartialFiles()
	}

	onDeltaStateSelected() {
		this._viewModel.selectedFileNames.delta.reference = this.getLastVisibleFileName()
		this.onDeltaComparisonFileChange(null)
	}

	selectAllPartialFiles() {
		const allFileNames = this._viewModel.files.map(x => x.file.fileMeta.fileName)
		this.onPartialFilesChange(allFileNames)
	}

	selectZeroPartialFiles() {
		this.onPartialFilesChange([])
	}

	invertPartialFileSelection() {
		const invertedFileNames: string[] = []
		const partialFileNames = new Set(this._viewModel.selectedFileNames.partial)

		for (const { file: { fileMeta: { fileName } } } of this._viewModel.files) {
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
