import "./filePanel.component.scss"
import { FileSelectionState, FileState } from "../../model/codeCharta.model"
import { IRootScopeService } from "angular"
import { FileStateService, FileStateSubscriber } from "../../state/fileState.service"
import { FileStateHelper } from "../../util/fileStateHelper"
import { StoreService } from "../../state/store.service"

interface SelectedFileNames {
	single: string
	delta: {
		reference: string
		comparison: string
	}
	partial: string[]
}

export class FilePanelController implements FileStateSubscriber {
	private lastRenderState: FileSelectionState

	private _viewModel: {
		isSingleState: boolean
		isPartialState: boolean
		isDeltaState: boolean
		fileStates: FileState[]
		renderState: FileSelectionState
		selectedFileNames: SelectedFileNames
		pictogramFirstFileColor: string
		pictogramUpperColor: string
		pictogramLowerColor: string
	} = {
		isSingleState: null,
		isPartialState: null,
		isDeltaState: null,
		fileStates: [],
		renderState: null,
		selectedFileNames: {
			single: null,
			delta: {
				reference: null,
				comparison: null
			},
			partial: null
		},
		pictogramFirstFileColor: null,
		pictogramUpperColor: null,
		pictogramLowerColor: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService, private fileStateService: FileStateService) {
		FileStateService.subscribe(this.$rootScope, this)
	}

	public onFileStatesChanged(fileStates: FileState[]) {
		this._viewModel.fileStates = fileStates
		this._viewModel.isSingleState = FileStateHelper.isSingleState(fileStates)
		this._viewModel.isPartialState = FileStateHelper.isPartialState(fileStates)
		this._viewModel.isDeltaState = FileStateHelper.isDeltaState(fileStates)
		this.setPictogramColor()
		this.updateSelectedFileNamesInViewModel(fileStates)
		this.lastRenderState = this._viewModel.renderState
	}

	private setPictogramColor() {
		this._viewModel.pictogramFirstFileColor = "#808080"
		this._viewModel.pictogramUpperColor = this.storeService.getState().appSettings.mapColors.positiveDelta
		this._viewModel.pictogramLowerColor = this.storeService.getState().appSettings.mapColors.negativeDelta
	}

	private updateSelectedFileNamesInViewModel(fileStates: FileState[]) {
		const visibleFileStates = FileStateHelper.getVisibleFileStates(fileStates)

		if (this._viewModel.isSingleState) {
			this._viewModel.renderState = FileSelectionState.Single
			this._viewModel.selectedFileNames.single = visibleFileStates[0].file.fileMeta.fileName
		} else if (this._viewModel.isPartialState) {
			this._viewModel.renderState = FileSelectionState.Partial
			this._viewModel.selectedFileNames.partial = visibleFileStates.map(x => x.file.fileMeta.fileName)
		} else if (this._viewModel.isDeltaState) {
			this._viewModel.renderState = FileSelectionState.Comparison

			this._viewModel.selectedFileNames.delta.reference =
				visibleFileStates.length == 2
					? visibleFileStates.find(x => x.selectedAs === FileSelectionState.Reference).file.fileMeta.fileName
					: visibleFileStates[0].file.fileMeta.fileName

			this._viewModel.selectedFileNames.delta.comparison =
				visibleFileStates.length == 2
					? visibleFileStates.find(x => x.selectedAs === FileSelectionState.Comparison).file.fileMeta.fileName
					: visibleFileStates[0].file.fileMeta.fileName
		}
	}

	public onSingleFileChange(singleFileName: string) {
		this.fileStateService.setSingleByName(singleFileName)
	}

	public onDeltaReferenceFileChange(referenceFileName: string) {
		this.fileStateService.setDeltaByNames(referenceFileName, this._viewModel.selectedFileNames.delta.comparison)
	}

	public onDeltaComparisonFileChange(comparisonFileName: string) {
		this.fileStateService.setDeltaByNames(this._viewModel.selectedFileNames.delta.reference, comparisonFileName)
	}

	public onPartialFilesChange(partialFileNames: string[]) {
		this.fileStateService.setMultipleByNames(partialFileNames)
	}

	public onSingleStateSelected() {
		this._viewModel.selectedFileNames.single = this.getLastVisibleFileName()
		this.onSingleFileChange(this._viewModel.selectedFileNames.single)
	}

	public onPartialStateSelected() {
		this.selectAllPartialFiles()
	}

	public onDeltaStateSelected() {
		this._viewModel.selectedFileNames.delta.reference = this.getLastVisibleFileName()
		this.onDeltaComparisonFileChange(null)
	}

	public selectAllPartialFiles() {
		const allFileNames = this.fileStateService.getFileStates().map(x => x.file.fileMeta.fileName)
		this.onPartialFilesChange(allFileNames)
	}

	public selectZeroPartialFiles() {
		this.onPartialFilesChange([])
	}

	public invertPartialFileSelection() {
		const invertedFileNames: string[] = this.fileStateService
			.getFileStates()
			.filter(x => x.selectedAs === FileSelectionState.None)
			.map(x => x.file.fileMeta.fileName)

		this.onPartialFilesChange(invertedFileNames)
	}

	private getLastVisibleFileName(): string {
		if (this.lastRenderState === FileSelectionState.Single) {
			return this._viewModel.selectedFileNames.single
		} else if (this.lastRenderState === FileSelectionState.Partial) {
			const visibleFileStates = FileStateHelper.getVisibleFileStates(this._viewModel.fileStates)
			if (FileStateHelper.getVisibleFileStates(this._viewModel.fileStates).length > 0) {
				return visibleFileStates[0].file.fileMeta.fileName
			} else {
				return this._viewModel.fileStates[0].file.fileMeta.fileName
			}
		} else if (this.lastRenderState === FileSelectionState.Comparison) {
			return this._viewModel.selectedFileNames.delta.reference
		}
	}
}

export const filePanelComponent = {
	selector: "filePanelComponent",
	template: require("./filePanel.component.html"),
	controller: FilePanelController
}
