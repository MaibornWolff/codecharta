import { CcState } from "../../../codeCharta.model"
import { CameraSection, PlainPosition, Scenario, ScenarioSections } from "../model/scenario.model"

export function buildScenarioSections(state: CcState, cameraPosition: PlainPosition, cameraTarget: PlainPosition): ScenarioSections {
    return {
        metrics: {
            areaMetric: state.dynamicSettings.areaMetric,
            heightMetric: state.dynamicSettings.heightMetric,
            colorMetric: state.dynamicSettings.colorMetric,
            edgeMetric: state.dynamicSettings.edgeMetric,
            distributionMetric: state.dynamicSettings.distributionMetric,
            isColorMetricLinkedToHeightMetric: state.appSettings.isColorMetricLinkedToHeightMetric
        },
        colors: {
            colorRange: { ...state.dynamicSettings.colorRange },
            colorMode: state.dynamicSettings.colorMode,
            mapColors: { ...state.appSettings.mapColors }
        },
        camera: {
            position: { ...cameraPosition },
            target: { ...cameraTarget }
        },
        filters: {
            blacklist: [...state.fileSettings.blacklist],
            focusedNodePath: [...state.dynamicSettings.focusedNodePath]
        },
        labelsAndFolders: {
            amountOfTopLabels: state.appSettings.amountOfTopLabels,
            showMetricLabelNameValue: state.appSettings.showMetricLabelNameValue,
            showMetricLabelNodeName: state.appSettings.showMetricLabelNodeName,
            enableFloorLabels: state.appSettings.enableFloorLabels,
            colorLabels: { ...state.appSettings.colorLabels },
            markedPackages: [...state.fileSettings.markedPackages]
        }
    }
}

export function buildScenario(
    name: string,
    state: CcState,
    cameraPosition: PlainPosition,
    cameraTarget: PlainPosition,
    description?: string
): Scenario {
    return {
        id: crypto.randomUUID(),
        name,
        description,
        createdAt: Date.now(),
        sections: buildScenarioSections(state, cameraPosition, cameraTarget)
    }
}
