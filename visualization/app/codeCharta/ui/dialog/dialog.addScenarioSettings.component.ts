import "./dialog.component.scss"
import { StoreService } from "../../state/store.service"
import { ScenarioHelper, ScenarioMetricProperty, ScenarioMetricType } from "../../util/scenarioHelper"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCameraService"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"

export class DialogAddScenarioSettingsComponent {
	private _viewModel: {
		scenarioName: string
		currentAttribute: string
		scenarioContent: ScenarioMetricProperty[]
	} = {
		scenarioName: "",
		currentAttribute: null,
		scenarioContent: []
	}

	constructor(
		private $mdDialog,
		private storeService: StoreService,
		private threeCameraService: ThreeCameraService,
		private threeOrbitControlsService: ThreeOrbitControlsService
	) {
		"ngInject"
		this.initDialogFields()
	}

	hide() {
		this.$mdDialog.hide()
	}

	addScenario() {
		const selectedScenarioAttributes = this._viewModel.scenarioContent.filter(x => x.isSelected)
		const newScenario = ScenarioHelper.createNewScenario(this._viewModel.scenarioName, selectedScenarioAttributes)
		ScenarioHelper.addScenario(newScenario)
		this.hide()
	}

	isNewScenarioValid() {
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
		this.pushScenarioContent("Camera-Position", "", {
			camera: this.threeCameraService.camera.position,
			cameraTarget: this.threeOrbitControlsService.controls.target
		})
		this.pushScenarioContent("Area-Metric", dynamicSettings.areaMetric, dynamicSettings.margin)
		this.pushScenarioContent("Height-Metric", dynamicSettings.heightMetric, {
			heightSlider: appSettings.scaling,
			labelSlider: appSettings.amountOfTopLabels
		})
		this.pushScenarioContent("Color-Metric", dynamicSettings.colorMetric, {
			colorRange: dynamicSettings.colorRange,
			mapColors: appSettings.mapColors
		})
		this.pushScenarioContent("Edge-Metric", dynamicSettings.edgeMetric, {
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
			isDisabled: metricName === "Edge" && this.storeService.getState().fileSettings.edges.length === 0
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
