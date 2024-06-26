"use strict"
import {
    LocalStorageScenarios,
    DynamicSettings,
    RecursivePartial,
    Scenario,
    MetricData,
    AppSettings,
    Settings
} from "../../../codeCharta.model"
import { convertToVectors } from "../../../util/settingsHelper"
import defaultScenarios from "../../../assets/scenarios.json"
import { ExportScenario } from "../../../codeCharta.api.model"
import { Vector3 } from "three"

export type ScenarioMetricType = "Camera-Position" | "Edge-Metric" | "Area-Metric" | "Height-Metric" | "Color-Metric"

export type ScenarioMetricProperty = {
    metricType: ScenarioMetricType
    metricName: string
    isSelected: boolean
    isDisabled: boolean
    savedValues: unknown
}

export interface ScenarioItem {
    scenarioName: string
    isScenarioApplicable: boolean
    icons: { faIconClass: string; isSaved: boolean; tooltip: string }[]
}

export class ScenarioHelper {
    private static readonly SCENARIOS_LOCAL_STORAGE_VERSION = "1.0.0"
    private static readonly SCENARIOS_LOCAL_STORAGE_ELEMENT = "scenarios"
    static scenarios: Map<string, RecursivePartial<Scenario>> = ScenarioHelper.loadScenarios()

    static getScenarioItems(metricData: MetricData) {
        const scenarioItems: ScenarioItem[] = []

        for (const scenario of this.scenarios.values()) {
            scenarioItems.push({
                scenarioName: scenario.name,
                isScenarioApplicable: this.isScenarioApplicable(scenario, metricData),
                icons: [
                    {
                        faIconClass: "fa-video-camera",
                        isSaved: Boolean(scenario.camera),
                        tooltip: "Camera angle"
                    },
                    {
                        faIconClass: "fa-arrows-alt",
                        isSaved: Boolean(scenario.area),
                        tooltip: "Area metric"
                    },
                    {
                        faIconClass: "fa-arrows-v",
                        isSaved: Boolean(scenario.height),
                        tooltip: "Height metric"
                    },
                    {
                        faIconClass: "fa-paint-brush",
                        isSaved: Boolean(scenario.color),
                        tooltip: "Color metric"
                    },
                    {
                        faIconClass: "fa-exchange",
                        isSaved: Boolean(scenario.edge),
                        tooltip: "Edge metric"
                    }
                ]
            })
        }
        return scenarioItems
    }

    private static isScenarioApplicable(scenario: RecursivePartial<Scenario>, metricData: MetricData) {
        const { area, color, height, edge } = scenario

        if (area || color || height) {
            const nodeMetricSet = new Set(metricData.nodeMetricData.map(data => data.name))

            if (
                (area && !nodeMetricSet.has(area.areaMetric)) ||
                (color && !nodeMetricSet.has(color.colorMetric)) ||
                (height && !nodeMetricSet.has(height.heightMetric))
            ) {
                return false
            }
        }

        return !(edge && !metricData.edgeMetricData.some(x => x.name === edge.edgeMetric))
    }

    private static getPreLoadScenarios() {
        const scenariosAsSettings = this.importScenarios(defaultScenarios)
        const scenario: Map<string, RecursivePartial<Scenario>> = new Map()
        for (const setting of scenariosAsSettings) {
            scenario.set(setting.name, this.transformScenarioAsSettingsToScenario(setting))
        }
        return scenario
    }

    private static transformScenarioAsSettingsToScenario(exportScenario: ExportScenario) {
        const scenario: RecursivePartial<Scenario> = { name: exportScenario.name }
        const { dynamicSettings, appSettings } = exportScenario.settings

        if (dynamicSettings.areaMetric !== undefined) {
            scenario.area = {
                areaMetric: dynamicSettings.areaMetric,
                margin: dynamicSettings.margin
            }
        }
        if (dynamicSettings.heightMetric !== undefined) {
            scenario.height = {
                heightMetric: dynamicSettings.heightMetric,
                labelSlider: appSettings.amountOfTopLabels,
                heightSlider: appSettings.scaling
            }
        }
        if (dynamicSettings.colorMetric !== undefined) {
            scenario.color = {
                colorMetric: dynamicSettings.colorMetric,
                colorRange: dynamicSettings.colorRange,
                mapColors: appSettings.mapColors
            }
        }
        if (dynamicSettings.edgeMetric !== undefined) {
            scenario.edge = {
                edgeMetric: dynamicSettings.edgeMetric,
                edgeHeight: appSettings.edgeHeight,
                edgePreview: appSettings.amountOfEdgePreviews
            }
        }

        return scenario
    }

    private static setScenariosToLocalStorage(scenarios: Map<string, RecursivePartial<Scenario>>) {
        const newLocalStorageElement: LocalStorageScenarios = {
            version: this.SCENARIOS_LOCAL_STORAGE_VERSION,
            scenarios: [...scenarios]
        }
        localStorage.setItem(this.SCENARIOS_LOCAL_STORAGE_ELEMENT, JSON.stringify(newLocalStorageElement))
    }

    private static loadScenarios() {
        const ccLocalStorage: LocalStorageScenarios = JSON.parse(localStorage.getItem(this.SCENARIOS_LOCAL_STORAGE_ELEMENT))
        if (ccLocalStorage) {
            return new Map(ccLocalStorage.scenarios)
        }
        const scenarios = this.getPreLoadScenarios()
        this.setScenariosToLocalStorage(scenarios)
        return scenarios
    }

    static addScenario(scenarioName: string, scenarioMetricProperties: ScenarioMetricProperty[]) {
        const newScenario = ScenarioHelper.createNewScenario(scenarioName, scenarioMetricProperties)
        this.scenarios.set(newScenario.name, newScenario)
        this.setScenariosToLocalStorage(this.scenarios)
    }

    static createNewScenario(scenarioName: string, scenarioMetricProperties: ScenarioMetricProperty[]) {
        const newScenario: RecursivePartial<Scenario> = { name: scenarioName }

        for (const property of scenarioMetricProperties.filter(p => p.isSelected)) {
            switch (property.metricType) {
                case "Camera-Position":
                    newScenario.camera = {
                        camera: property.savedValues["camera"],
                        cameraTarget: property.savedValues["cameraTarget"]
                    }
                    break

                case "Area-Metric":
                    newScenario.area = {
                        areaMetric: property.metricName,
                        margin: property.savedValues as number
                    }
                    break

                case "Height-Metric":
                    newScenario.height = {
                        heightMetric: property.metricName,
                        heightSlider: property.savedValues["heightSlider"],
                        labelSlider: property.savedValues["labelSlider"]
                    }
                    break

                case "Color-Metric":
                    newScenario.color = {
                        colorMetric: property.metricName,
                        colorRange: property.savedValues["colorRange"],
                        mapColors: property.savedValues["mapColors"]
                    }
                    break

                case "Edge-Metric":
                    newScenario.edge = {
                        edgeMetric: property.metricName,
                        edgePreview: property.savedValues["edgePreview"],
                        edgeHeight: property.savedValues["edgeHeight"]
                    }
                    break

                default:
                    throw new Error(`Unknown metric type "${property.metricType}" detected`)
            }
        }

        return newScenario
    }

    static deleteScenario(scenarioName: string) {
        this.scenarios.delete(scenarioName)
        this.setScenariosToLocalStorage(this.scenarios)
    }

    static getScenarioSettings(scenario: RecursivePartial<Scenario>): RecursivePartial<Settings> {
        const partialDynamicSettings: RecursivePartial<DynamicSettings> = {}
        const partialAppSettings: RecursivePartial<AppSettings> = {}

        if (scenario) {
            if (scenario.area) {
                partialDynamicSettings.areaMetric = scenario.area.areaMetric
                partialDynamicSettings.margin = scenario.area.margin
            }
            if (scenario.height) {
                partialDynamicSettings.heightMetric = scenario.height.heightMetric
                partialAppSettings.amountOfTopLabels = scenario.height.labelSlider
                partialAppSettings.scaling = scenario.height.heightSlider
            }
            if (scenario.color) {
                partialDynamicSettings.colorMetric = scenario.color.colorMetric
                partialDynamicSettings.colorRange = scenario.color.colorRange
                partialAppSettings.mapColors = scenario.color.mapColors
            }
            if (scenario.edge) {
                partialDynamicSettings.edgeMetric = scenario.edge.edgeMetric
                partialAppSettings.edgeHeight = scenario.edge.edgeHeight
                partialAppSettings.amountOfEdgePreviews = scenario.edge.edgePreview
            }
        }

        return { appSettings: partialAppSettings, dynamicSettings: partialDynamicSettings }
    }

    static importScenarios(scenarios: ExportScenario[]) {
        for (const scenario of scenarios) {
            convertToVectors(scenario.settings)
            if (scenario.camera) {
                scenario.camera.camera = new Vector3(scenario.camera.camera.x, scenario.camera.camera.y, scenario.camera.camera.z)
                scenario.camera.cameraTarget = new Vector3(scenario.camera.camera.x, scenario.camera.camera.y, scenario.camera.camera.z)
            }
        }
        return scenarios
    }

    static isScenarioExisting(scenarioName: string) {
        return this.scenarios.has(scenarioName)
    }
}
