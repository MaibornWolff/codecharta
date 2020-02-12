import "./filePanel.component.scss"
import { FileSelectionState, FileState } from "../../model/codeCharta.model"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { setDeltaByNames, setMultipleByNames, setSingleByName } from "../../state/store/files/files.actions"
import { FilesService, FilesSubscriber } from "../../state/store/files/files.service"
import { Files } from "../../model/files"

interface SelectedFileNames {
	single: string
	delta: {
		reference: string
		comparison: string
	}
	partial: string[]
}

export class FilePanelController implements FilesSubscriber {
	private lastRenderState: FileSelectionState

	//TODO: try to use Files instead of FileStates
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
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		FilesService.subscribe(this.$rootScope, this)
	}

	public onFilesChanged(files: Files) {
		this._viewModel.fileStates = files.getFiles()
		this._viewModel.isSingleState = files.isSingleState()
		this._viewModel.isPartialState = files.isPartialState()
		this._viewModel.isDeltaState = files.isDeltaState()
		this.setPictogramColor()
		this.updateSelectedFileNamesInViewModel()
		this.lastRenderState = this._viewModel.renderState
	}

	private setPictogramColor() {
		this._viewModel.pictogramFirstFileColor = "#808080"
		this._viewModel.pictogramUpperColor = this.storeService.getState().appSettings.mapColors.positiveDelta
		this._viewModel.pictogramLowerColor = this.storeService.getState().appSettings.mapColors.negativeDelta
	}

	private updateSelectedFileNamesInViewModel() {
		const visibleFileStates = this.storeService.getState().files.getVisibleFileStates()

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
		this.storeService.dispatch(setSingleByName(singleFileName))
	}

	public onDeltaReferenceFileChange(referenceFileName: string) {
		this.storeService.dispatch(setDeltaByNames(referenceFileName, this._viewModel.selectedFileNames.delta.comparison))
	}

	public onDeltaComparisonFileChange(comparisonFileName: string) {
		this.storeService.dispatch(setDeltaByNames(this._viewModel.selectedFileNames.delta.reference, comparisonFileName))
	}

	public onPartialFilesChange(partialFileNames: string[]) {
		this.storeService.dispatch(setMultipleByNames(partialFileNames))
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
		const allFileNames = this.storeService
			.getState()
			.files.getFiles()
			.map(x => x.file.fileMeta.fileName)
		this.onPartialFilesChange(allFileNames)
	}

	//TODO: Check if this method does something
	public selectZeroPartialFiles() {
		this.onPartialFilesChange([])
	}

	public invertPartialFileSelection() {
		const invertedFileNames: string[] = this.storeService
			.getState()
			.files.getFiles()
			.filter(x => x.selectedAs === FileSelectionState.None)
			.map(x => x.file.fileMeta.fileName)

		this.onPartialFilesChange(invertedFileNames)
	}

	private getLastVisibleFileName(): string {
		if (this.lastRenderState === FileSelectionState.Single) {
			return this._viewModel.selectedFileNames.single
		} else if (this.lastRenderState === FileSelectionState.Partial) {
			const visibleFileStates = this.storeService.getState().files.getVisibleFileStates()
			if (visibleFileStates.length > 0) {
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
