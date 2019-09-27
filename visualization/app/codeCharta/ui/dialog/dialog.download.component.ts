import "./dialog.component.scss"
import { FileDownloader } from "../../util/fileDownloader"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { BlacklistType, FileSettings, AttributeTypes, FileMeta, CodeMapNode } from "../../codeCharta.model"
import { hierarchy } from "d3-hierarchy"
import _ from "lodash"
import { FileNameHelper } from "../../util/fileNameHelper"
import { SettingsService } from "../../state/settingsService/settings.service"
import { FileStateService } from "../../state/fileState.service"
import { FileStateHelper } from "../../util/fileStateHelper"

interface FileDownloadContent {
	name: string
	numberOfListItems: number
	isSelected: boolean
	isDisabled: boolean
}

export enum DownloadCheckboxNames {
	edges = "Edges",
	excludes = "Excludes",
	hides = "Hides",
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

	constructor(
		private $mdDialog,
		private codeMapPreRenderService: CodeMapPreRenderService,
		private settingsService: SettingsService,
		private fileStateService: FileStateService
	) {
		this.initDialogFields()
	}

	public hide() {
		this.$mdDialog.hide()
	}

	public download() {
		FileDownloader.downloadCurrentMap(
			this.codeMapPreRenderService.getRenderMap(),
			this.codeMapPreRenderService.getRenderFileMeta(),
			this.settingsService.getSettings().fileSettings,
			this._viewModel.fileContent.filter(x => x.isSelected == true).map(x => x.name),
			this._viewModel.fileName
		)
		this.$mdDialog.hide()
	}

	private initDialogFields() {
		const map: CodeMapNode = this.codeMapPreRenderService.getRenderMap()
		const fileMeta: FileMeta = this.codeMapPreRenderService.getRenderFileMeta()
		const fileSettings: FileSettings = this.settingsService.getSettings().fileSettings
		const isDeltaState: boolean = FileStateHelper.isDeltaState(this.fileStateService.getFileStates())

		this.setFileContentList(fileSettings)
		this._viewModel.fileName = FileNameHelper.getNewFileName(fileMeta.fileName, isDeltaState)
		this._viewModel.amountOfNodes = hierarchy(map).descendants().length
		this._viewModel.amountOfAttributeTypes = this.getAmountOfAttributeTypes(fileSettings.attributeTypes)
		this._viewModel.fileContent = this._viewModel.fileContent.sort((a, b) => this.sortByDisabled(a, b))
	}

	private setFileContentList(fileSettings: FileSettings) {
		this.pushFileContent(DownloadCheckboxNames.edges, fileSettings.edges.length)
		this.pushFileContent(DownloadCheckboxNames.markedPackages, fileSettings.markedPackages.length)
		this.pushFileContent(DownloadCheckboxNames.excludes, this.getFilteredBlacklistLength(fileSettings, BlacklistType.exclude))
		this.pushFileContent(DownloadCheckboxNames.hides, this.getFilteredBlacklistLength(fileSettings, BlacklistType.hide))
	}

	private getFilteredBlacklistLength(fileSettings: FileSettings, blacklistType: BlacklistType) {
		return fileSettings.blacklist.filter(x => x.type == blacklistType).length
	}

	private pushFileContent(name: string, numberOfListItems: number) {
		this._viewModel.fileContent.push({
			name: name,
			numberOfListItems: numberOfListItems,
			isSelected: numberOfListItems > 0,
			isDisabled: !numberOfListItems || numberOfListItems == 0
		})
	}

	private getAmountOfAttributeTypes(attributeTypes: AttributeTypes) {
		let sum: number = 0
		sum += attributeTypes.nodes ? attributeTypes.nodes.length : 0
		sum += attributeTypes.edges ? attributeTypes.edges.length : 0
		return sum
	}

	private sortByDisabled(a: FileDownloadContent, b: FileDownloadContent) {
		return a.isDisabled === b.isDisabled ? 0 : a.isDisabled ? 1 : -1
	}
}

export const dialogDownloadComponent = {
	clickOutsideToClose: true,
	template: require("./dialog.download.component.html"),
	controller: DialogDownloadController,
	controllerAs: "$ctrl"
}
