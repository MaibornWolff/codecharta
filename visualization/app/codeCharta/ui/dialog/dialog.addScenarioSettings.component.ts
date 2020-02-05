import "./dialog.component.scss"
import { AppSettings, DynamicSettings } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { ScenarioHelper } from "../../util/scenarioHelper"
import { DialogService } from "./dialog.service"

export interface AddAttributeContent {
	metricName: string
	currentMetric: string
	isSelected: boolean
	isDisabled: boolean
	metricAttributeValue: any
}

export enum ScenarioCheckboxNames {
	cameraPosition = "CameraPosition",
	edgeMetric = "Edge",
	areaMetric = "Area",
	HeightMetric = "Height",
	ColorMetric = "Color"
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
		if (ScenarioHelper.isScenarioExisting(this._viewModel.scenarioName)) {
			this.dialogService.showErrorDialog("The Scenario Name is already taken, please chose another Scenario Name.")
		} else {
			const chosenMetrics: AddAttributeContent[] = this._viewModel.fileContent.filter(x => x.isSelected == true)
			ScenarioHelper.createNewScenario(this._viewModel.scenarioName, chosenMetrics)
			this.hide()
		}
	}

	private initDialogFields() {
		this.setFileContentList()
		this.setFileName()
	}

	private setFileContentList() {
		const dynamicSettings: DynamicSettings = this.storeService.getState().dynamicSettings
		const appSettings: AppSettings = this.storeService.getState().appSettings
		this.pushFileContent(ScenarioCheckboxNames.areaMetric, dynamicSettings.areaMetric, dynamicSettings.margin)
		this.pushFileContent(ScenarioCheckboxNames.HeightMetric, dynamicSettings.heightMetric, {
			heightSlider: appSettings.scaling,
			labelSlider: appSettings.amountOfTopLabels
		})
		this.pushFileContent(ScenarioCheckboxNames.ColorMetric, dynamicSettings.colorMetric)
		this.pushFileContent(ScenarioCheckboxNames.edgeMetric, dynamicSettings.edgeMetric, {
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

	private setFileName() {
		this._viewModel.scenarioName = "ScenarioDefault" + ScenarioHelper.getNumberOfScenarios()
	}
}

export const addScenarioSettingsComponent = {
	selector: "addScenarioSettingsComponent",
	template: require("./dialog.addScenarioSettings.component.html"),
	controller: DialogAddScenarioSettingsComponent,
	clickOutsideToClose: true,
	controllerAs: "$ctrl"
}
