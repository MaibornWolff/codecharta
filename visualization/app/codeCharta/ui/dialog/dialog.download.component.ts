import "./dialog.component.scss"
import { FileDownloader } from "../../util/fileDownloader"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { BlacklistType } from "../../codeCharta.model"
import { hierarchy } from "d3-hierarchy"
import { FileNameHelper } from "../../util/fileNameHelper"
import { StoreService } from "../../state/store.service"
import { isDeltaState } from "../../model/files/files.helper"
import { FileNote } from "../attributeSideBar/attributeSideBar.component"
import { FileSelectionState, FileState } from "../../model/files/files"

interface FileDownloadContent {
	name: string
	numberOfListItems: number
	isSelected: boolean
	isDisabled: boolean
}

export enum DownloadCheckboxNames {
	edges = "Edges",
	excludes = "Excludes",
	flattens = "Flattens",
	markedPackages = "MarkedPackages",
	notes = "Notes"
}

export class DialogDownloadController {
	private _viewModel: {
		fileName: string
		amountOfNodes: number
		amountOfAttributeTypes: number
		fileContent: FileDownloadContent[]
	} = {
		fileName: null,
		amountOfNodes: null,
		amountOfAttributeTypes: null,
		fileContent: []
	}
	private readonly NOTES_LOCAL_STORAGE_ELEMENT = "notes"

	constructor(private $mdDialog, private codeMapPreRenderService: CodeMapPreRenderService, private storeService: StoreService) {
		"ngInject"
		this.initDialogFields()
	}

	hide() {
		this.$mdDialog.hide()
	}

	download() {
		FileDownloader.downloadCurrentMap(
			this.codeMapPreRenderService.getRenderMap(),
			this.codeMapPreRenderService.getRenderFileMeta(),
			this.storeService.getState().fileSettings,
			this._viewModel.fileContent.filter(x => x.isSelected === true).map(x => x.name),
			this._viewModel.fileName
		)
		this.hide()
	}

	private initDialogFields() {
		this.setFileContentList()
		this.setFileName()
		this.setAmountOfNodes()
		this.setAmountOfAttributeTypes()
		this.setSortedDownloadableFileSettings()
	}

	private setFileContentList() {
		const { fileSettings } = this.storeService.getState()
		this.pushFileContent(DownloadCheckboxNames.edges, fileSettings.edges.length)
		this.pushFileContent(DownloadCheckboxNames.markedPackages, fileSettings.markedPackages.length)
		this.pushFileContent(DownloadCheckboxNames.excludes, this.getFilteredBlacklistLength(BlacklistType.exclude))
		this.pushFileContent(DownloadCheckboxNames.flattens, this.getFilteredBlacklistLength(BlacklistType.flatten))
		this.getNotesLength()
		this.pushFileContent(DownloadCheckboxNames.notes, this.getNotesLength())
	}

	private getFilteredBlacklistLength(blacklistType: BlacklistType) {
		let count = 0
		for (const entry of this.storeService.getState().fileSettings.blacklist) {
			if (entry.type === blacklistType) {
				count++
			}
		}
		return count
	}

	private pushFileContent(name: string, numberOfListItems: number) {
		this._viewModel.fileContent.push({
			name,
			numberOfListItems,
			isSelected: numberOfListItems > 0,
			isDisabled: !numberOfListItems
		})
	}

	private setFileName() {
		const fileMeta = this.codeMapPreRenderService.getRenderFileMeta()
		this._viewModel.fileName = FileNameHelper.getNewFileName(fileMeta.fileName, isDeltaState(this.storeService.getState().files))
	}

	private setAmountOfNodes() {
		const map = this.codeMapPreRenderService.getRenderMap()
		let amountOfNodes = 0
		hierarchy(map).each(() => amountOfNodes++)
		this._viewModel.amountOfNodes = amountOfNodes
	}

	private setAmountOfAttributeTypes() {
		this._viewModel.amountOfAttributeTypes = this.getAmountOfAttributeTypes()
	}

	private getAmountOfAttributeTypes() {
		const { attributeTypes } = this.storeService.getState().fileSettings
		let sum = 0
		sum += attributeTypes.nodes ? Object.keys(attributeTypes.nodes).length : 0
		sum += attributeTypes.edges ? Object.keys(attributeTypes.edges).length : 0
		return sum
	}

	private setSortedDownloadableFileSettings() {
		this._viewModel.fileContent.sort((a, b) => this.sortByDisabled(a, b))
	}

	private sortByDisabled(a: FileDownloadContent, b: FileDownloadContent) {
		return a.isDisabled === b.isDisabled ? 0 : a.isDisabled ? 1 : -1
	}

	private getNotesLength() {
		const fileNotes = JSON.parse(localStorage.getItem(this.NOTES_LOCAL_STORAGE_ELEMENT)) as FileNote[]
		const selectedFiles = this.storeService
			.getState()
			.files.filter(file => file.selectedAs === FileSelectionState.Single || file.selectedAs === FileSelectionState.Partial)
		const currentMapFileNotes = fileNotes.filter(fileNote => this.isFromSelectedFile(fileNote.path, selectedFiles))
		return currentMapFileNotes.length
	}

	private isFromSelectedFile(path: string, selectedFiles: FileState[]) {
		return selectedFiles.some(file => path.startsWith(file.file.fileMeta.fileName))
	}
}

export const dialogDownloadComponent = {
	selector: "dialogDownloadComponent",
	template: require("./dialog.download.component.html"),
	controller: DialogDownloadController,
	clickOutsideToClose: true,
	controllerAs: "$ctrl"
}
