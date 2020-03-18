import "./dialog.component.scss"
import { AppSettings, DynamicSettings } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { Scenario, ScenarioHelper } from "../../util/scenarioHelper"
import { DialogService } from "./dialog.service"

export interface AddScenarioContent {
	metricType: ScenarioMetricType
	metricName: string
	isSelected: boolean
	isDisabled: boolean
	savedValues: any
}

export enum ScenarioMetricType {
	CAMERA_POSITION = "Camera-Position",
	EDGE_METRIC = "Edge-Metric",
	AREA_METRIC = "Area-Metric",
	HEIGHT_METRIC = "Height-Metric",
	COLOR_METRIC = "Color-Metric"
}

export class DialogAddScenarioSettingsComponent {
	private _viewModel: {
		scenarioName: string
		currentAttribute: string
		scenarioContent: AddScenarioContent[]
	} = {
		scenarioName: "",
		currentAttribute: null,
		scenarioContent: []
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
			!this.isAnyScenarioContentSelected()
		) {
			this.dialogService.showErrorDialog(
				"Please select a non existing Scenario Name and select at least one attribute to be saved in the Scenario."
			)
		} else {
			const selectedScenarioAttributes: AddScenarioContent[] = this._viewModel.scenarioContent.filter(x => x.isSelected == true)
			const newScenario: Scenario = ScenarioHelper.createNewScenario(this._viewModel.scenarioName, selectedScenarioAttributes)
			ScenarioHelper.addScenario(newScenario)
			this.hide()
		}
	}

	private isAnyScenarioContentSelected() {
		return this._viewModel.scenarioContent.some(x => x.isSelected)
	}

	private isScenarioNameEmpty() {
		return this._viewModel.scenarioName === ""
	}

	private initDialogFields() {
		this.setScenarioContentList()
	}

	private setScenarioContentList() {
		const dynamicSettings: DynamicSettings = this.storeService.getState().dynamicSettings
		const appSettings: AppSettings = this.storeService.getState().appSettings
		this.pushScenarioContent(ScenarioMetricType.CAMERA_POSITION, null, {
			camera: appSettings.camera,
			cameraTarget: appSettings.cameraTarget
		})
		this.pushScenarioContent(ScenarioMetricType.AREA_METRIC, dynamicSettings.areaMetric, dynamicSettings.margin)
		this.pushScenarioContent(ScenarioMetricType.HEIGHT_METRIC, dynamicSettings.heightMetric, {
			heightSlider: appSettings.scaling,
			labelSlider: appSettings.amountOfTopLabels
		})
		this.pushScenarioContent(ScenarioMetricType.COLOR_METRIC, dynamicSettings.colorMetric, dynamicSettings.colorRange)
		this.pushScenarioContent(ScenarioMetricType.EDGE_METRIC, dynamicSettings.edgeMetric, {
			edgePreview: appSettings.amountOfEdgePreviews,
			edgeHeight: appSettings.edgeHeight
		})
	}

	private pushScenarioContent(metricType: ScenarioMetricType, metricName: string, savedValues?: any) {
		this._viewModel.scenarioContent.push({
			metricType: metricType,
			metricName: metricName,
			savedValues: savedValues,
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
