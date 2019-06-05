import "./dialog.component.scss"
import { FileDownloader } from "../../util/fileDownloader"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { CCFile, BlacklistType, FileSettings } from "../../codeCharta.model"
import { hierarchy } from "d3-hierarchy"
import _ from "lodash"
import { FileNameHelper } from "../../util/fileNameHelper"

interface FileDownloadContent {
	name: string
	numberOfListItems: number
	isSelected: boolean
	isDisabled: boolean
}

export enum DownloadCheckboxNames {
	nodes = "Nodes",
	edges = "Edges",
	excludes = "Excludes",
	hides = "Hides",
	markedPackages = "MarkedPackages"
}

export class DialogDownlodController {
	private _viewModel: {
		fileName: string
		amountOfNodes: number
		fileContent: FileDownloadContent[]
	} = {
		fileName: null,
		amountOfNodes: null,
		fileContent: []
	}

	constructor(private $mdDialog, private codeMapPreRenderService: CodeMapPreRenderService) {
		this.initDialogFields()
	}

	private initDialogFields() {
		const file: CCFile = this.codeMapPreRenderService.getRenderFile()
		this.setFileContentList(file)
		this._viewModel.fileName = FileNameHelper.getNewFileName(file.fileMeta.fileName)
		this._viewModel.amountOfNodes = hierarchy(file.map).descendants().length
		this._viewModel.fileContent = this._viewModel.fileContent.sort((a, b) => this.sortByDisabled(a, b))
	}

	private setFileContentList(file: CCFile) {
		const s: FileSettings = file.settings.fileSettings
		this.pushFileContent(DownloadCheckboxNames.edges, s.edges.length)
		this.pushFileContent(DownloadCheckboxNames.markedPackages, s.markedPackages.length)
		this.pushFileContent(DownloadCheckboxNames.excludes, this.getFilteredBlacklistLength(s, BlacklistType.exclude))
		this.pushFileContent(DownloadCheckboxNames.hides, this.getFilteredBlacklistLength(s, BlacklistType.hide))
	}

	private getFilteredBlacklistLength(s: FileSettings, blacklistType: BlacklistType) {
		return s.blacklist.filter(x => x.type == blacklistType).length
	}

	private pushFileContent(name: string, numberOfListItems: number) {
		this._viewModel.fileContent.push({
			name: name,
			numberOfListItems: numberOfListItems,
			isSelected: numberOfListItems > 0,
			isDisabled: !numberOfListItems || numberOfListItems == 0
		})
	}

	private sortByDisabled(a: FileDownloadContent, b: FileDownloadContent) {
		return a.isDisabled === b.isDisabled ? 0 : a.isDisabled ? 1 : -1
	}

	public hide() {
		this.$mdDialog.hide()
	}

	public download() {
		FileDownloader.downloadCurrentMap(
			this.codeMapPreRenderService.getRenderFile(),
			this._viewModel.fileContent.filter(x => x.isSelected == true).map(x => x.name),
			this._viewModel.fileName
		)
		this.$mdDialog.hide()
	}
}

export const dialogDownlodComponent = {
	clickOutsideToClose: true,
	template: require("./dialog.download.component.html"),
	controller: DialogDownlodController,
	controllerAs: "$ctrl"
}
