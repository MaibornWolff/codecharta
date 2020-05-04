"use strict"
import { AppSettings, ColorRange, DynamicSettings, MetricData, RecursivePartial, Settings } from "../codeCharta.model"
import { convertToVectors } from "./settingsHelper"
import { AddScenarioContent, ScenarioMetricType } from "../ui/dialog/dialog.addScenarioSettings.component"
import { ScenarioItem } from "../ui/scenarioDropDown/scenarioDropDown.component"
import { Vector3 } from "three"

export interface Scenario {
	name: string
	settings: RecursivePartial<Settings>
}

interface CCLocalStorage {
	version: string
	scenarios: RecursivePartial<Scenario>[]
}

export interface Scenery {
	name: string
	area: {
		areaMetric: string
		margin: number
	}
	height: {
		heightMetric: string
		heightSlider: number
		labelSlider: number
	}
	color: {
		colorMetric: string
		colorRange: ColorRange
	}
	camera: {
		camera: Vector3
		cameraTarget: Vector3
	}
	edge: {
		edgeMetric: string
		edgePreview: number
		edgeHeight: number
	}
}

export class ScenarioHelper {
	//TODO: Move Scenarios to Redux Store
	private static scenarioList: Scenario[] = ScenarioHelper.loadScenarios()
	private static scenarioLists: RecursivePartial<Scenery>[] = ScenarioHelper.loadScenarioss()

	public static getScenarioItems(metricData: MetricData[]) {
		const scenarioItemList: ScenarioItem[] = []

		this.scenarioList.forEach(scenario => {
			scenarioItemList.push({
				scenarioName: scenario.name,
				isScenarioAppliable: this.isScenarioAppliable(scenario.settings.dynamicSettings, metricData),
				icons: [
					{
						faIconClass: "fa-video-camera",
						isSaved: !!scenario.settings.appSettings.camera
					},
					{
						faIconClass: "fa-arrows-alt",
						isSaved: !!scenario.settings.dynamicSettings.areaMetric
					},
					{
						faIconClass: "fa-paint-brush",
						isSaved: !!scenario.settings.dynamicSettings.colorMetric
					},
					{
						faIconClass: "fa-arrows-v",
						isSaved: !!scenario.settings.dynamicSettings.heightMetric
					},
					{
						faIconClass: "fa-exchange",
						isSaved: !!scenario.settings.dynamicSettings.edgeMetric
					}
				]
			})
		})
		return scenarioItemList
	}
	public static getScenarioItemss(metricData: MetricData[]) {
		const scenarioItemList: ScenarioItem[] = []

		this.scenarioLists.forEach(scenery => {
			scenarioItemList.push({
				scenarioName: scenery.name,
				isScenarioAppliable: this.isScenarioAppliablee(scenery, metricData),
				icons: [
					{
						faIconClass: "fa-video-camera",
						isSaved: !!scenery.camera
					},
					{
						faIconClass: "fa-arrows-alt",
						isSaved: !!scenery.area
					},
					{
						faIconClass: "fa-paint-brush",
						isSaved: !!scenery.color
					},
					{
						faIconClass: "fa-arrows-v",
						isSaved: !!scenery.height
					},
					{
						faIconClass: "fa-exchange",
						isSaved: !!scenery.edge
					}
				]
			})
		})
		return scenarioItemList
	}

	private static isScenarioAppliable(scenario: RecursivePartial<DynamicSettings>, metricData: MetricData[]) {
		for (let attribute in scenario) {
			if (
				typeof scenario[attribute] === "string" &&
				!metricData.find(x => x.name == scenario[attribute]) === true &&
				scenario[attribute] !== "None"
			) {
				return false
			}
		}
		return true
	}

	private static isScenarioAppliablee(scenario: RecursivePartial<Scenery>, metricData: MetricData[]) {
		if (scenario.area && !metricData.find(value => value.name === scenario.area.areaMetric)) {
			return false
		}
		if (scenario.color && !metricData.find(value => value.name === scenario.color.colorMetric)) {
			return false
		}
		if (scenario.height && !metricData.find(value => value.name === scenario.height.heightMetric)) {
			return false
		}

		return true
	}

	private static getPreLoadScenarios(): Scenario[] {
		return this.importScenarios(require("../assets/scenarios.json"))
	}
	private static getPreLoadScenarioss() {
		const scenariosAsSettings: Scenario[] = this.importScenarios(require("../assets/scenarios.json"))
		const scenery: RecursivePartial<Scenery>[] = []
		scenariosAsSettings.forEach(scenarioSettings => {
			scenery.push(this.transformScenarioToScenery(scenarioSettings))
		})
		return scenery
	}

	private static transformScenarioToScenery(scenarioAsSettings: Scenario) {
		const scenery: RecursivePartial<Scenery> = { name: scenarioAsSettings.name }
		const dynamicSettings: RecursivePartial<DynamicSettings> = scenarioAsSettings.settings.dynamicSettings
		const appSettings: RecursivePartial<AppSettings> = scenarioAsSettings.settings.appSettings

		for (let scenarioKey in dynamicSettings) {
			switch (scenarioKey) {
				case "areaMetric": {
					scenery.area = {
						areaMetric: dynamicSettings.areaMetric,
						margin: dynamicSettings.margin
					}
					break
				}
				case "heightMetric": {
					scenery.height = {
						heightMetric: dynamicSettings.heightMetric,
						labelSlider: appSettings.amountOfTopLabels,
						heightSlider: appSettings.scaling
					}
					break
				}
				case "colorMetric": {
					scenery.color = {
						colorMetric: dynamicSettings.colorMetric,
						colorRange: dynamicSettings.colorRange
					}
					break
				}
				case "edgeMetric": {
					scenery.edge = {
						edgeMetric: dynamicSettings.edgeMetric,
						edgeHeight: appSettings.edgeHeight,
						edgePreview: appSettings.amountOfEdgePreviews
					}
					break
				}
			}
			if (appSettings.camera) {
				scenery.camera = {
					camera: appSettings.camera,
					cameraTarget: appSettings.cameraTarget
				}
			}
		}

		return scenery
	}

	private static setScenariosToLocalStorage(scenarios: Scenario[]) {
		localStorage.setItem("scenarios", JSON.stringify(scenarios))
	}
	private static setScenariosToLocalStoragee(scenarios: RecursivePartial<Scenery>[]) {
		const newLocalStorageElement: CCLocalStorage = { version: "1.2", scenarios: scenarios }
		localStorage.setItem("scenarioss", JSON.stringify(newLocalStorageElement))
	}

	private static loadScenarios(): Scenario[] {
		const localStorageScenarios: Scenario[] = JSON.parse(localStorage.getItem("scenarios"))
		if (localStorageScenarios) {
			return localStorageScenarios
		} else {
			this.setScenariosToLocalStorage(this.getPreLoadScenarios())
			return this.getPreLoadScenarios()
		}
	}

	private static loadScenarioss(): RecursivePartial<Scenery>[] {
		const ccLocalStorage: CCLocalStorage = JSON.parse(localStorage.getItem("scenarioss"))
		if (ccLocalStorage) {
			return ccLocalStorage.scenarios
		} else {
			this.setScenariosToLocalStoragee(this.getPreLoadScenarioss())
			return this.getPreLoadScenarioss()
		}
	}

	private static createScenarioObjectWithPartialSettings(
		partialAppSettings: RecursivePartial<AppSettings>,
		partialDynamicSettings: RecursivePartial<DynamicSettings>
	) {
		const newScenario: Scenario = {
			name,
			settings: {
				appSettings: partialAppSettings,
				dynamicSettings: partialDynamicSettings
			}
		}
		return newScenario
	}

	public static addScenario(newScenario: Scenario) {
		this.scenarioList.push(newScenario)
		this.setScenariosToLocalStorage(this.scenarioList)
	}

	public static addScenarios(newScenario: RecursivePartial<Scenery>) {
		this.scenarioLists.push(newScenario)
		this.setScenariosToLocalStoragee(this.scenarioLists)
	}

	public static createNewScenario(scenarioName: string, scenarioAttributes: AddScenarioContent[]) {
		const partialDynamicSettings: RecursivePartial<DynamicSettings> = {}
		const partialAppSettings: RecursivePartial<AppSettings> = {}

		scenarioAttributes.forEach(attribute => {
			switch (attribute.metricType) {
				case ScenarioMetricType.CAMERA_POSITION: {
					partialAppSettings.camera = attribute.savedValues["camera"]
					partialAppSettings.cameraTarget = attribute.savedValues["cameraTarget"]
					break
				}
				case ScenarioMetricType.AREA_METRIC: {
					partialDynamicSettings.areaMetric = attribute.metricName
					partialDynamicSettings.margin = attribute.savedValues
					break
				}
				case ScenarioMetricType.HEIGHT_METRIC: {
					partialDynamicSettings.heightMetric = attribute.metricName
					partialAppSettings.scaling = attribute.savedValues["heightSlider"]
					partialAppSettings.amountOfTopLabels = attribute.savedValues["labelSlider"]
					break
				}
				case ScenarioMetricType.COLOR_METRIC: {
					partialDynamicSettings.colorMetric = attribute.metricName
					partialDynamicSettings.colorRange = attribute.savedValues
					break
				}
				case ScenarioMetricType.EDGE_METRIC: {
					partialDynamicSettings.edgeMetric = attribute.metricName
					partialAppSettings.amountOfEdgePreviews = attribute.savedValues["edgePreview"]
					partialAppSettings.edgeHeight = attribute.savedValues["edgeHeight"]
					break
				}
			}
		})

		const newScenarioObject: Scenario = this.createScenarioObjectWithPartialSettings(partialAppSettings, partialDynamicSettings)
		newScenarioObject.name = scenarioName

		return newScenarioObject
	}

	public static createNewScenarios(scenarioName: string, scenarioAttributes: AddScenarioContent[]) {
		const newScenery: RecursivePartial<Scenery> = { name: scenarioName }

		scenarioAttributes.forEach(attribute => {
			switch (attribute.metricType) {
				case ScenarioMetricType.CAMERA_POSITION: {
					newScenery.camera = {
						camera: attribute.savedValues["camera"],
						cameraTarget: attribute.savedValues["cameraTarget"]
					}
					break
				}
				case ScenarioMetricType.AREA_METRIC: {
					newScenery.area = {
						areaMetric: attribute.metricName,
						margin: attribute.savedValues
					}
					break
				}
				case ScenarioMetricType.HEIGHT_METRIC: {
					newScenery.height = {
						heightMetric: attribute.metricName,
						heightSlider: attribute.savedValues["heightSlider"],
						labelSlider: attribute.savedValues["labelSlider"]
					}
					break
				}
				case ScenarioMetricType.COLOR_METRIC: {
					newScenery.color = {
						colorMetric: attribute.metricName,
						colorRange: attribute.savedValues
					}
					break
				}
				case ScenarioMetricType.EDGE_METRIC: {
					newScenery.edge = {
						edgeMetric: attribute.metricName,
						edgePreview: attribute.savedValues["edgePreview"],
						edgeHeight: attribute.savedValues["edgeHeight"]
					}
					break
				}
			}
		})

		return newScenery
	}

	public static deleteScenario(scenarioName: String) {
		this.scenarioList = this.scenarioList.filter(item => {
			return item.name !== scenarioName
		})
		this.scenarioLists = this.scenarioLists.filter(item => {
			return item.name !== scenarioName
		})
		this.setScenariosToLocalStorage(this.scenarioList)
		this.setScenariosToLocalStoragee(this.scenarioLists)
	}

	public static getDefaultScenario(): Scenario {
		return this.scenarioList.find(s => s.name == "Complexity")
	}
	public static getDefaultScenarioSetting(): RecursivePartial<Settings> {
		return this.getScenarioSettingsByNames("Complexity")
	}

	public static getScenarioSettingsByName(name: string): RecursivePartial<Settings> {
		return this.scenarioList.find(s => s.name == name).settings
	}

	public static getScenarioSettingsByNames(name: string): RecursivePartial<Settings> {
		const scenery: RecursivePartial<Scenery> = this.scenarioLists.find(s => s.name == name)
		const partialDynamicSettings: RecursivePartial<DynamicSettings> = {}
		const partialAppSettings: RecursivePartial<AppSettings> = {}

		for (let sceneryKey in scenery) {
			switch (sceneryKey) {
				case "area": {
					partialDynamicSettings.areaMetric = scenery.area.areaMetric
					partialDynamicSettings.margin = scenery.area.margin
					break
				}
				case "height": {
					partialDynamicSettings.heightMetric = scenery.height.heightMetric
					partialAppSettings.amountOfTopLabels = scenery.height.labelSlider
					partialAppSettings.scaling = scenery.height.heightSlider
					break
				}
				case "color": {
					partialDynamicSettings.colorMetric = scenery.color.colorMetric
					partialDynamicSettings.colorRange = scenery.color.colorRange
					break
				}
				case "edge": {
					partialDynamicSettings.edgeMetric = scenery.edge.edgeMetric
					partialAppSettings.edgeHeight = scenery.edge.edgeHeight
					partialAppSettings.amountOfEdgePreviews = scenery.edge.edgePreview
					break
				}
				case "camera": {
					partialAppSettings.camera = scenery.camera.camera
					partialAppSettings.cameraTarget = scenery.camera.cameraTarget
				}
			}
		}

		return { appSettings: partialAppSettings, dynamicSettings: partialDynamicSettings }
	}

	public static importScenarios(scenarios: Scenario[]): Scenario[] {
		scenarios.forEach(scenario => {
			convertToVectors(scenario.settings)
		})
		return scenarios
	}

	public static isScenarioExisting(scenarioName: string) {
		return this.scenarioList.some(x => x.name == scenarioName)
	}
	public static isScenarioExistings(scenarioName: string) {
		return this.scenarioLists.some(x => x.name == scenarioName)
	}
}
