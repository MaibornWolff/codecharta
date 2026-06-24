import { Injectable } from "@angular/core"
import { Vector3 } from "three"
import { CcState, MetricData, RecursivePartial } from "../../../codeCharta.model"
import { ThreeCameraService } from "../../../features/codeMap/facade"
import { ThreeMapControlsService } from "../../../features/codeMap/facade"
import { ThreeRendererService } from "../../../features/codeMap/facade"
import {
    ColorsSection,
    FiltersSection,
    LabelsAndFoldersSection,
    MetricsSection,
    Scenario,
    ScenarioSectionKey,
    ScenarioSections
} from "../model/scenario.model"
import { ScenarioApplierStore } from "../stores/scenarioApplier.store"

export interface MissingMetrics {
    nodeMetrics: string[]
    edgeMetrics: string[]
}

const NODE_METRIC_KEYS = ["areaMetric", "heightMetric", "colorMetric", "distributionMetric"] as const

@Injectable({ providedIn: "root" })
export class ScenarioApplierService {
    isApplying = false

    constructor(
        private readonly scenarioApplierStore: ScenarioApplierStore,
        private readonly threeCameraService: ThreeCameraService,
        private readonly threeMapControlsService: ThreeMapControlsService,
        private readonly threeRendererService: ThreeRendererService
    ) {}

    getAvailableMetricNames(metricData: MetricData): { nodeMetrics: Set<string>; edgeMetrics: Set<string> } {
        return {
            nodeMetrics: new Set(metricData.nodeMetricData.map(m => m.name)),
            edgeMetrics: new Set(metricData.edgeMetricData.map(m => m.name))
        }
    }

    getMissingMetrics(metricsSection: MetricsSection, metricData: MetricData): MissingMetrics {
        const available = this.getAvailableMetricNames(metricData)

        const requiredNodeMetrics = [
            metricsSection.areaMetric,
            metricsSection.heightMetric,
            metricsSection.colorMetric,
            metricsSection.distributionMetric
        ].filter((m): m is string => !!m)

        const nodeMetrics = [...new Set(requiredNodeMetrics.filter(m => !available.nodeMetrics.has(m)))]
        const edgeMetrics =
            metricsSection.edgeMetric && !available.edgeMetrics.has(metricsSection.edgeMetric) ? [metricsSection.edgeMetric] : []

        return { nodeMetrics, edgeMetrics }
    }

    hasMissingMetrics(missing: MissingMetrics): boolean {
        return missing.nodeMetrics.length > 0 || missing.edgeMetrics.length > 0
    }

    buildOrderedStatePatches(
        sections: ScenarioSections,
        selectedKeys: Set<ScenarioSectionKey>,
        metricData?: MetricData
    ): RecursivePartial<CcState>[] {
        return [
            selectedKeys.has("metrics") && sections.metrics ? this.buildMetricsPatch(sections, metricData) : undefined,
            selectedKeys.has("colors") && sections.colors ? this.buildColorsPatch(sections.colors) : undefined,
            this.buildFiltersAndLabelsPatch(sections, selectedKeys)
        ].filter((patch): patch is RecursivePartial<CcState> => patch !== undefined)
    }

    getCameraVectors(sections: ScenarioSections): { position: Vector3; target: Vector3 } | undefined {
        if (!sections.camera) {
            return undefined
        }
        const { position, target } = sections.camera
        return {
            position: new Vector3(position.x, position.y, position.z),
            target: new Vector3(target.x, target.y, target.z)
        }
    }

    async applyScenario(scenario: Scenario, selectedKeys: Set<ScenarioSectionKey>, metricData?: MetricData): Promise<void> {
        this.isApplying = true
        this.scenarioApplierStore.setIsLoadingFile(true)

        try {
            const cameraVectors = selectedKeys.has("camera") ? this.getCameraVectors(scenario.sections) : undefined
            const applyCamera = cameraVectors !== undefined
            const patches = this.buildOrderedStatePatches(scenario.sections, selectedKeys, metricData)

            // When applying camera, temporarily disable autoFit so it doesn't
            // overwrite our camera position after the render cycle completes.
            const previousResetCamera =
                applyCamera && patches.length > 0
                    ? this.scenarioApplierStore.getValue().appSettings.resetCameraIfNewFileIsLoaded
                    : undefined
            if (previousResetCamera && patches.length > 0) {
                patches[0].appSettings = { ...patches[0].appSettings, resetCameraIfNewFileIsLoaded: false }
            }

            // Dispatch patches with macrotask delays so effects triggered by
            // earlier patches (e.g. resetColorRange after metric change)
            // settle before subsequent patches override their values.
            for (const patch of patches) {
                this.scenarioApplierStore.setStatePatch(patch)
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
                        this.scenarioApplierStore.setStatePatch({ appSettings: { resetCameraIfNewFileIsLoaded: true } })
                    })
                }
            }

            this.threeRendererService.render()
        } finally {
            this.isApplying = false
            this.scenarioApplierStore.setIsLoadingFile(false)
            this.scenarioApplierStore.setIsLoadingMap(false)
        }
    }

    private buildMetricsPatch(sections: ScenarioSections, metricData?: MetricData): RecursivePartial<CcState> {
        if (!sections.metrics) {
            return {}
        }

        const availableMetricNames = metricData ? this.getAvailableMetricNames(metricData) : undefined
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

    private buildColorsPatch(colors: ColorsSection): RecursivePartial<CcState> {
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

    private buildFiltersPatch(filters: FiltersSection): RecursivePartial<CcState> {
        return {
            fileSettings: { blacklist: [...filters.blacklist] },
            dynamicSettings: { focusedNodePath: [...filters.focusedNodePath] }
        }
    }

    private buildLabelsAndFoldersPatch(labelsAndFolders: LabelsAndFoldersSection): RecursivePartial<CcState> {
        return {
            appSettings: {
                amountOfTopLabels: labelsAndFolders.amountOfTopLabels,
                labelSize: labelsAndFolders.labelSize,
                showMetricLabelNameValue: labelsAndFolders.showMetricLabelNameValue,
                showMetricLabelNodeName: labelsAndFolders.showMetricLabelNodeName,
                enableFloorLabels: labelsAndFolders.enableFloorLabels,
                colorLabels: labelsAndFolders.colorLabels,
                labelMode: labelsAndFolders.labelMode,
                groupLabelCollisions: labelsAndFolders.groupLabelCollisions
            },
            fileSettings: { markedPackages: [...labelsAndFolders.markedPackages] }
        }
    }

    private mergePatches(a: RecursivePartial<CcState>, b: RecursivePartial<CcState>): RecursivePartial<CcState> {
        return {
            ...a,
            ...b,
            ...(a.appSettings || b.appSettings ? { appSettings: { ...a.appSettings, ...b.appSettings } } : {}),
            ...(a.dynamicSettings || b.dynamicSettings ? { dynamicSettings: { ...a.dynamicSettings, ...b.dynamicSettings } } : {}),
            ...(a.fileSettings || b.fileSettings ? { fileSettings: { ...a.fileSettings, ...b.fileSettings } } : {})
        }
    }

    private buildFiltersAndLabelsPatch(
        sections: ScenarioSections,
        selectedKeys: Set<ScenarioSectionKey>
    ): RecursivePartial<CcState> | undefined {
        const filtersPatch = selectedKeys.has("filters") && sections.filters ? this.buildFiltersPatch(sections.filters) : undefined
        const labelsPatch =
            selectedKeys.has("labelsAndFolders") && sections.labelsAndFolders
                ? this.buildLabelsAndFoldersPatch(sections.labelsAndFolders)
                : undefined
        if (filtersPatch && labelsPatch) {
            return this.mergePatches(filtersPatch, labelsPatch)
        }
        return filtersPatch ?? labelsPatch
    }
}
