import "./dialog.component.scss"
import { DynamicSettings } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"

interface AddAttributeContent {
	metricName: string
	currentMetric: string
	isSelected: boolean
	isDisabled: boolean
}

export enum DownloadCheckboxNames {
	cameraPosition = "CameraPosition",
	edgeMetric = "Edge",
	areaMetric = "Area",
	HeightMetric = "Height",
	ColorMetric = "Color"
}

export class DialogAddScenarioSettingsComponent {
	private _viewModel: {
		fileName: string
		currentAttribute: string
		fileContent: AddAttributeContent[]
	} = {
		fileName: null,
		currentAttribute: null,
		fileContent: []
	}

	constructor(
		private $mdDialog,
		//private codeMapPreRenderService: CodeMapPreRenderService,
		private storeService: StoreService
	) {
		this.initDialogFields()
	}

	public hide() {
		this.$mdDialog.hide()
	}

	public addScenario() {
		/*
        FileDownloader.downloadCurrentMap(
            this.codeMapPreRenderService.getRenderMap(),
            this.codeMapPreRenderService.getRenderFileMeta(),
            this.storeService.getState().fileSettings,
            this._viewModel.fileContent.filter(x => x.isSelected == true).map(x => x.metricName),
            this._viewModel.fileName
        )*/
		const chosenMetrics: AddAttributeContent[] = this._viewModel.fileContent.filter(x => x.isSelected == true)
		console.log("selected values: ", chosenMetrics)
		this.hide()
	}

	private initDialogFields() {
		this.setFileContentList()
		this.setFileName()
		this.setSortedDownloadableFileSettings()
	}

	private setFileContentList() {
		const dynamicSettings: DynamicSettings = this.storeService.getState().dynamicSettings
		this.pushFileContent(DownloadCheckboxNames.areaMetric, dynamicSettings.areaMetric)
		this.pushFileContent(DownloadCheckboxNames.ColorMetric, dynamicSettings.colorMetric)
		this.pushFileContent(DownloadCheckboxNames.edgeMetric, dynamicSettings.edgeMetric)
		this.pushFileContent(DownloadCheckboxNames.HeightMetric, dynamicSettings.heightMetric)
	}

	private pushFileContent(name: string, currentAttribute: string) {
		this._viewModel.fileContent.push({
			metricName: name,
			currentMetric: currentAttribute,
			isSelected: true,
			isDisabled: name === "Edge" && this.storeService.getState().fileSettings.edges.length === 0
		})
	}

	private setFileName() {
		// TODO: Change default value for scenarioName
		this._viewModel.fileName = "ScenarioDefault"
	}

	private setSortedDownloadableFileSettings() {
		this._viewModel.fileContent = this._viewModel.fileContent.sort((a, b) => this.sortByDisabled(a, b))
	}

	private sortByDisabled(a: AddAttributeContent, b: AddAttributeContent) {
		return a.isDisabled === b.isDisabled ? 0 : a.isDisabled ? 1 : -1
	}
}

export const addScenarioSettingsComponent = {
	selector: "addScenarioSettingsComponent",
	template: require("./dialog.addScenarioSettings.component.html"),
	controller: DialogAddScenarioSettingsComponent,
	clickOutsideToClose: true,
	controllerAs: "$ctrl"
}
