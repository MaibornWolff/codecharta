import { Injectable } from "@angular/core"
import { Store, State } from "@ngrx/store"
import { Vector3 } from "three"
import { RecursivePartial, CcState, MetricData } from "../../../codeCharta.model"
import { setState } from "../../../state/store/state.actions"
import { setIsLoadingFile } from "../../../state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import { setIsLoadingMap } from "../../../state/store/appSettings/isLoadingMap/isLoadingMap.actions"
import { ThreeCameraService } from "../../../ui/codeMap/threeViewer/threeCamera.service"
import { ThreeMapControlsService } from "../../../ui/codeMap/threeViewer/threeMapControls.service"
import { ThreeRendererService } from "../../../ui/codeMap/threeViewer/threeRenderer.service"
import {
    ColorsSection,
    FiltersSection,
    LabelsAndFoldersSection,
    Scenario,
    ScenarioSectionKey,
    ScenarioSections
} from "../model/scenario.model"

const NODE_METRIC_KEYS = ["areaMetric", "heightMetric", "colorMetric", "distributionMetric"] as const

export function getAvailableMetricNames(metricData: MetricData): { nodeMetrics: Set<string>; edgeMetrics: Set<string> } {
    return {
        nodeMetrics: new Set(metricData.nodeMetricData.map(m => m.name)),
        edgeMetrics: new Set(metricData.edgeMetricData.map(m => m.name))
    }
}

function buildMetricsPatch(sections: ScenarioSections, metricData?: MetricData): RecursivePartial<CcState> {
    if (!sections.metrics) {
        return {}
    }

    const availableMetricNames = metricData ? getAvailableMetricNames(metricData) : undefined
    const metricOverrides: Record<string, string | undefined> = {}

    for (const key of NODE_METRIC_KEYS) {
        const value = sections.metrics[key]
        if (value !== undefined && (!availableMetricNames || availableMetricNames.nodeMetrics.has(value))) {
            metricOverrides[key] = value
        }
    }

    const edgeMetric = sections.metrics.edgeMetric
    if (edgeMetric !== undefined && (!availableMetricNames || !edgeMetric || availableMetricNames.edgeMetrics.has(edgeMetric))) {
        metricOverrides.edgeMetric = edgeMetric
    }

    const hasMetricOverrides = Object.keys(metricOverrides).length > 0
    if (!hasMetricOverrides && sections.metrics.isColorMetricLinkedToHeightMetric === undefined) {
        return {}
    }

    const patch: RecursivePartial<CcState> = {}
    if (hasMetricOverrides) {
        patch.dynamicSettings = { ...metricOverrides }
        if (sections.metrics.isColorMetricLinkedToHeightMetric !== undefined) {
            patch.appSettings = { isColorMetricLinkedToHeightMetric: sections.metrics.isColorMetricLinkedToHeightMetric }
        }
    }
    return patch
}

function buildColorsPatch(colors: ColorsSection): RecursivePartial<CcState> {
    const dynamicSettings: RecursivePartial<CcState["dynamicSettings"]> = { colorRange: colors.colorRange }
    if (colors.colorMode !== undefined) {
        dynamicSettings.colorMode = colors.colorMode
    }
    const patch: RecursivePartial<CcState> = { dynamicSettings }
    if (colors.mapColors !== undefined) {
        patch.appSettings = { mapColors: colors.mapColors }
    }
    return patch
}

function buildFiltersPatch(filters: FiltersSection): RecursivePartial<CcState> {
    return {
        fileSettings: { blacklist: [...filters.blacklist] },
        dynamicSettings: { focusedNodePath: [...filters.focusedNodePath] }
    }
}

function buildLabelsAndFoldersPatch(labelsAndFolders: LabelsAndFoldersSection): RecursivePartial<CcState> {
    return {
        appSettings: {
            amountOfTopLabels: labelsAndFolders.amountOfTopLabels,
            showMetricLabelNameValue: labelsAndFolders.showMetricLabelNameValue,
            showMetricLabelNodeName: labelsAndFolders.showMetricLabelNodeName,
            enableFloorLabels: labelsAndFolders.enableFloorLabels,
            colorLabels: labelsAndFolders.colorLabels
        },
        fileSettings: { markedPackages: [...labelsAndFolders.markedPackages] }
    }
}

function mergePatches(a: RecursivePartial<CcState>, b: RecursivePartial<CcState>): RecursivePartial<CcState> {
    return {
        ...a,
        ...b,
        ...(a.appSettings || b.appSettings ? { appSettings: { ...a.appSettings, ...b.appSettings } } : {}),
        ...(a.dynamicSettings || b.dynamicSettings ? { dynamicSettings: { ...a.dynamicSettings, ...b.dynamicSettings } } : {}),
        ...(a.fileSettings || b.fileSettings ? { fileSettings: { ...a.fileSettings, ...b.fileSettings } } : {})
    }
}

export function buildOrderedStatePatches(
    sections: ScenarioSections,
    selectedKeys: Set<ScenarioSectionKey>,
    metricData?: MetricData
): RecursivePartial<CcState>[] {
    return [
        selectedKeys.has("metrics") && sections.metrics ? buildMetricsPatch(sections, metricData) : undefined,
        selectedKeys.has("colors") && sections.colors ? buildColorsPatch(sections.colors) : undefined,
        buildFiltersAndLabelsPatch(sections, selectedKeys)
    ].filter((patch): patch is RecursivePartial<CcState> => patch !== undefined)
}

function buildFiltersAndLabelsPatch(
    sections: ScenarioSections,
    selectedKeys: Set<ScenarioSectionKey>
): RecursivePartial<CcState> | undefined {
    const filtersPatch = selectedKeys.has("filters") && sections.filters ? buildFiltersPatch(sections.filters) : undefined
    const labelsPatch =
        selectedKeys.has("labelsAndFolders") && sections.labelsAndFolders
            ? buildLabelsAndFoldersPatch(sections.labelsAndFolders)
            : undefined
    if (filtersPatch && labelsPatch) {
        return mergePatches(filtersPatch, labelsPatch)
    }
    return filtersPatch ?? labelsPatch
}

export function getCameraVectors(sections: ScenarioSections): { position: Vector3; target: Vector3 } | undefined {
    if (!sections.camera) {
        return undefined
    }
    const { position, target } = sections.camera
    return {
        position: new Vector3(position.x, position.y, position.z),
        target: new Vector3(target.x, target.y, target.z)
    }
}

@Injectable({ providedIn: "root" })
export class ScenarioApplierService {
    isApplying = false

    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>,
        private readonly threeCameraService: ThreeCameraService,
        private readonly threeMapControlsService: ThreeMapControlsService,
        private readonly threeRendererService: ThreeRendererService
    ) {}

    async applyScenario(scenario: Scenario, selectedKeys: Set<ScenarioSectionKey>, metricData?: MetricData): Promise<void> {
        this.isApplying = true
        this.store.dispatch(setIsLoadingFile({ value: true }))

        try {
            const cameraVectors = selectedKeys.has("camera") ? getCameraVectors(scenario.sections) : undefined
            const applyCamera = cameraVectors !== undefined
            const patches = buildOrderedStatePatches(scenario.sections, selectedKeys, metricData)

            // When applying camera, temporarily disable autoFit so it doesn't
            // overwrite our camera position after the render cycle completes.
            const previousResetCamera =
                applyCamera && patches.length > 0 ? this.state.getValue().appSettings.resetCameraIfNewFileIsLoaded : undefined
            if (previousResetCamera && patches.length > 0) {
                patches[0].appSettings = { ...patches[0].appSettings, resetCameraIfNewFileIsLoaded: false }
            }

            // Dispatch patches with macrotask delays so effects triggered by
            // earlier patches (e.g. resetColorRange after metric change)
            // settle before subsequent patches override their values.
            for (const patch of patches) {
                this.store.dispatch(setState({ value: patch }))
                await new Promise<void>(resolve => setTimeout(resolve))
            }

            if (applyCamera && this.threeCameraService.camera) {
                const { position, target } = cameraVectors
                this.threeCameraService.camera.position.set(position.x, position.y, position.z)
                this.threeMapControlsService.setControlTarget(target)
                this.threeCameraService.camera.lookAt(target)
                this.threeCameraService.camera.updateProjectionMatrix()
                this.threeMapControlsService.updateControls()

                // Restore resetCameraIfNewFileIsLoaded after autoFit window has passed.
                if (previousResetCamera) {
                    setTimeout(() => {
                        this.store.dispatch(setState({ value: { appSettings: { resetCameraIfNewFileIsLoaded: true } } }))
                    })
                }
            }

            this.threeRendererService.render()
        } finally {
            this.isApplying = false
            this.store.dispatch(setIsLoadingFile({ value: false }))
            this.store.dispatch(setIsLoadingMap({ value: false }))
        }
    }
}
