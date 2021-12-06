import "./dialog.component.scss"
import { FileDownloader } from "../../util/fileDownloader"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { BlacklistType } from "../../codeCharta.model"
import { hierarchy } from "d3-hierarchy"
import { FileNameHelper } from "../../util/fileNameHelper"
import { StoreService } from "../../state/store.service"
import { isDeltaState } from "../../model/files/files.helper"
//import {STLExporter} from "three/examples/jsm/exporters/STLExporter";
import { CodeMapMeshChangedSubscriber, ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { CodeMapMesh } from "../codeMap/rendering/codeMapMesh"
import { STLExporter } from "three/examples/jsm/exporters/STLExporter"
//import {ThreeRendererService} from "../codeMap/threeViewer/threeRendererService";

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

export class DialogDownloadController implements CodeMapMeshChangedSubscriber {
	onCodeMapMeshChanged(mapMesh: CodeMapMesh) {
		// eslint-disable-next-line no-console
		console.log(mapMesh)
	}
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
		private storeService: StoreService,
		private threeSceneService: ThreeSceneService
	) {
		"ngInject"
		this.initDialogFields()
		this.exportBinary(this.threeSceneService.getMapMesh().getThreeMesh())
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

	exporter = new STLExporter()
	private exportBinary(mesh) {
		const result = this.exporter.parse(mesh, { binary: true })
		// eslint-disable-next-line no-console
		console.log(result)
		this.saveArrayBuffer(result, "box.stl")
	}

	// const link = document.createElement( 'a' );
	// link.style.display = 'none';
	// document.body.appendChild( link );

	// private save( blob, filename ) {
	//
	// 	link.href = URL.createObjectURL( blob );
	// 	link.download = filename;
	// 	link.click();
	//
	// }

	// private saveString( text, filename ) {
	//
	// 	this.save( new Blob( [ text ], { type: 'text/plain' } ), filename );
	//
	// }

	private saveArrayBuffer(buffer, filename) {
		FileDownloader.downloadData(buffer, filename)
		//this.save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );
	}
}

export const dialogDownloadComponent = {
	selector: "dialogDownloadComponent",
	template: require("./dialog.download.component.html"),
	controller: DialogDownloadController,
	clickOutsideToClose: true,
	controllerAs: "$ctrl"
}
