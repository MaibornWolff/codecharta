import "./dialog.component.scss"
import { StoreService } from "../../state/store.service"
import { ScenarioHelper } from "../../util/scenarioHelper"

export interface AddScenarioContent {
	metricType: ScenarioMetricType
	metricName: string
	isSelected: boolean
	isDisabled: boolean
	savedValues: unknown
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

	constructor(private $mdDialog, private storeService: StoreService) {
		this.initDialogFields()
	}

	public hide() {
		this.$mdDialog.hide()
	}

	public addScenario() {
		const selectedScenarioAttributes = this._viewModel.scenarioContent.filter(x => x.isSelected)
		const newScenario = ScenarioHelper.createNewScenario(this._viewModel.scenarioName, selectedScenarioAttributes)
		ScenarioHelper.addScenario(newScenario)
		this.hide()
	}

	public isNewScenarioValid() {
		return (
			this.isAnyScenarioContentSelected() &&
			!this.isScenarioNameEmpty() &&
			!ScenarioHelper.isScenarioExisting(this._viewModel.scenarioName)
		)
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
		const { dynamicSettings } = this.storeService.getState()
		const { appSettings } = this.storeService.getState()
		this.pushScenarioContent(ScenarioMetricType.CAMERA_POSITION, "", {
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

	private pushScenarioContent(metricType: ScenarioMetricType, metricName: string, savedValues?: unknown) {
		this._viewModel.scenarioContent.push({
			metricType,
			metricName,
			savedValues,
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
