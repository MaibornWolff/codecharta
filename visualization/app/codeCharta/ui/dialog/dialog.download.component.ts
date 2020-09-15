import "./dialog.component.scss"
import { FileDownloader } from "../../util/fileDownloader"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { BlacklistType } from "../../codeCharta.model"
import { hierarchy } from "d3-hierarchy"
import { FileNameHelper } from "../../util/fileNameHelper"
import { StoreService } from "../../state/store.service"
import { isDeltaState } from "../../model/files/files.helper"

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
	markedPackages = "MarkedPackages"
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

	constructor(private $mdDialog, private codeMapPreRenderService: CodeMapPreRenderService, private storeService: StoreService) {
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
	}

	private getFilteredBlacklistLength(blacklistType: BlacklistType) {
		return this.storeService.getState().fileSettings.blacklist.filter(x => x.type === blacklistType).length
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
		this._viewModel.amountOfNodes = hierarchy(map).descendants().length
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
}

export const dialogDownloadComponent = {
	selector: "dialogDownloadComponent",
	template: require("./dialog.download.component.html"),
	controller: DialogDownloadController,
	clickOutsideToClose: true,
	controllerAs: "$ctrl"
}
