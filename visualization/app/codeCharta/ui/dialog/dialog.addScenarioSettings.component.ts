import "./dialog.component.scss"
import { AppSettings, DynamicSettings } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { Scenario, ScenarioHelper } from "../../util/scenarioHelper"
import { DialogService } from "./dialog.service"

export interface AddAttributeContent {
	metricName: string
	currentMetric: string
	isSelected: boolean
	isDisabled: boolean
	metricAttributeValue: any
}

export enum ScenarioCheckboxNames {
	CAMERA_POSITION = "CameraPosition",
	EDGE_METRIC = "Edge",
	AREA_METRIC = "Area",
	HEIGHT_METRIC = "Height",
	COLOR_METRIC = "Color"
}

export class DialogAddScenarioSettingsComponent {
	private _viewModel: {
		scenarioName: string
		currentAttribute: string
		fileContent: AddAttributeContent[]
	} = {
		scenarioName: null,
		currentAttribute: null,
		fileContent: []
	}

	constructor(private $mdDialog, private storeService: StoreService, private dialogService: DialogService) {
		this.initDialogFields()
	}

	public hide() {
		this.$mdDialog.hide()
	}

	public addScenario() {
		if (
			ScenarioHelper.isScenarioExisting(this._viewModel.scenarioName) ||
			this.isScenarioNameEmpty() ||
			!this.isFileContentSelected()
		) {
			this.dialogService.showErrorDialog(
				"Please select a non existing Scenario Name and select at least one attribute to be saved in the Scenario."
			)
		} else {
			const selectedScenarioAttributes: AddAttributeContent[] = this._viewModel.fileContent.filter(x => x.isSelected == true)
			const newScenario: Scenario = ScenarioHelper.createNewScenario(this._viewModel.scenarioName, selectedScenarioAttributes)
			ScenarioHelper.addScenario(newScenario)
			this.hide()
		}
	}

	private isFileContentSelected() {
		return this._viewModel.fileContent.filter(x => x.isSelected).length > 0
	}

	private isScenarioNameEmpty() {
		return this._viewModel.scenarioName == null
	}

	private initDialogFields() {
		this.setFileContentList()
	}

	private setFileContentList() {
		const dynamicSettings: DynamicSettings = this.storeService.getState().dynamicSettings
		const appSettings: AppSettings = this.storeService.getState().appSettings
		this.pushFileContent(ScenarioCheckboxNames.CAMERA_POSITION, null, appSettings.camera)
		this.pushFileContent(ScenarioCheckboxNames.AREA_METRIC, dynamicSettings.areaMetric, dynamicSettings.margin)
		this.pushFileContent(ScenarioCheckboxNames.HEIGHT_METRIC, dynamicSettings.heightMetric, {
			heightSlider: appSettings.scaling,
			labelSlider: appSettings.amountOfTopLabels
		})
		this.pushFileContent(ScenarioCheckboxNames.COLOR_METRIC, dynamicSettings.colorMetric, dynamicSettings.colorRange)
		this.pushFileContent(ScenarioCheckboxNames.EDGE_METRIC, dynamicSettings.edgeMetric, {
			edgePreview: appSettings.amountOfEdgePreviews,
			edgeHeight: appSettings.edgeHeight
		})
	}

	private pushFileContent(name: string, currentAttribute: string, metricSliderValues?: any) {
		this._viewModel.fileContent.push({
			metricName: name,
			currentMetric: currentAttribute,
			metricAttributeValue: metricSliderValues,
			isSelected: true,
			isDisabled: name === "Edge" && this.storeService.getState().fileSettings.edges.length === 0
		})
	}
}

export const addScenarioSettingsComponent = {
	selector: "addScenarioSettingsComponent",
	template: require("./dialog.addScenarioSettings.component.html"),
	controller: DialogAddScenarioSettingsComponent,
	clickOutsideToClose: true,
	controllerAs: "$ctrl"
}
