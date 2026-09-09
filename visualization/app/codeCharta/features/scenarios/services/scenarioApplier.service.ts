import { Injectable } from "@angular/core"
import { Vector3 } from "three"
import { CcState, MetricData, RecursivePartial } from "../../../model/codeCharta.model"
import { ThreeCameraService, ThreeMapControlsService, ThreeRendererService } from "../../../renderer/threeViewer/threeViewer.facade"
import { setIsApplyingScenario } from "../../../util/busy/isApplyingScenario"
import { Scenario } from "../model/scenario.model"
import { isMetricSelectionKey, SCENARIO_SETTINGS, ScenarioSettingKey, ScenarioSettings } from "../model/scenarioSettings.registry"
import { ScenariosStore } from "../stores/scenarios.store"

export interface MissingMetrics {
    nodeMetrics: string[]
    edgeMetrics: string[]
}

const NODE_METRIC_KEYS = ["areaMetric", "heightMetric", "colorMetric"] as const

@Injectable({ providedIn: "root" })
export class ScenarioApplierService {
    constructor(
        private readonly scenariosStore: ScenariosStore,
        private readonly threeCameraService: ThreeCameraService,
        private readonly threeMapControlsService: ThreeMapControlsService,
        private readonly threeRendererService: ThreeRendererService
    ) {}

    getAvailableMetricNames(metricData: MetricData): { nodeMetrics: Set<string>; edgeMetrics: Set<string> } {
        return {
            nodeMetrics: new Set(metricData.nodeMetricData.map(metric => metric.name)),
            edgeMetrics: new Set(metricData.edgeMetricData.map(metric => metric.name))
        }
    }

    getMissingMetrics(settings: ScenarioSettings, metricData: MetricData): MissingMetrics {
        const available = this.getAvailableMetricNames(metricData)
        const requiredNodeMetrics = NODE_METRIC_KEYS.map(key => settings[key]).filter((metric): metric is string => Boolean(metric))

        return {
            nodeMetrics: [...new Set(requiredNodeMetrics.filter(metric => !available.nodeMetrics.has(metric)))],
            edgeMetrics: settings.edgeMetric && !available.edgeMetrics.has(settings.edgeMetric) ? [settings.edgeMetric] : []
        }
    }

    hasMissingMetrics(missing: MissingMetrics): boolean {
        return missing.nodeMetrics.length > 0 || missing.edgeMetrics.length > 0
    }

    /**
     * Metric selections come first: effects derive from them — changing the color metric recalculates
     * the color range, changing the edge metric clamps the amount of edge previews — so the settings a
     * scenario saved for those must be patched afterwards to win.
     */
    buildOrderedStatePatches(
        settings: ScenarioSettings,
        selectedKeys: ReadonlySet<ScenarioSettingKey>,
        metricData?: MetricData
    ): RecursivePartial<CcState>[] {
        const applicableKeys = this.getApplicableKeys(settings, selectedKeys, metricData)

        return [
            this.mergePatchesOf(settings, applicableKeys.filter(isMetricSelectionKey)),
            this.mergePatchesOf(
                settings,
                applicableKeys.filter(key => !isMetricSelectionKey(key))
            )
        ].filter(patch => Object.keys(patch).length > 0)
    }

    getCameraVectors(settings: ScenarioSettings): { position: Vector3; target: Vector3 } | undefined {
        if (!settings.camera) {
            return undefined
        }
        const { position, target } = settings.camera
        return {
            position: new Vector3(position.x, position.y, position.z),
            target: new Vector3(target.x, target.y, target.z)
        }
    }

    async applyScenario(scenario: Scenario, selectedKeys: ReadonlySet<ScenarioSettingKey>, metricData?: MetricData): Promise<void> {
        setIsApplyingScenario(true)

        try {
            const cameraVectors = selectedKeys.has("camera") ? this.getCameraVectors(scenario.settings) : undefined
            const applyCamera = cameraVectors !== undefined
            const patches = this.buildOrderedStatePatches(scenario.settings, selectedKeys, metricData)

            // When applying camera, temporarily disable autoFit so it doesn't
            // overwrite our camera position after the render cycle completes.
            const previousResetCamera =
                applyCamera && patches.length > 0 ? this.scenariosStore.getValue().preferences.resetCameraIfNewFileIsLoaded : undefined
            if (previousResetCamera && patches.length > 0) {
                patches[0].preferences = { ...patches[0].preferences, resetCameraIfNewFileIsLoaded: false }
            }

            // Dispatch patches with macrotask delays so effects triggered by
            // earlier patches (e.g. resetColorRange after metric change)
            // settle before subsequent patches override their values.
            for (const patch of patches) {
                this.scenariosStore.setStatePatch(patch)
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
                        this.scenariosStore.setStatePatch({ preferences: { resetCameraIfNewFileIsLoaded: true } })
                    })
                }
            }

            this.threeRendererService.render()
        } finally {
            setIsApplyingScenario(false)
        }
    }

    private getApplicableKeys(
        settings: ScenarioSettings,
        selectedKeys: ReadonlySet<ScenarioSettingKey>,
        metricData?: MetricData
    ): ScenarioSettingKey[] {
        const availableMetricNames = metricData ? this.getAvailableMetricNames(metricData) : undefined

        return [...selectedKeys].filter(
            key =>
                settings[key] !== undefined &&
                SCENARIO_SETTINGS[key].patch !== undefined &&
                this.isMetricAvailable(key, settings, availableMetricNames)
        )
    }

    private isMetricAvailable(
        key: ScenarioSettingKey,
        settings: ScenarioSettings,
        availableMetricNames?: { nodeMetrics: Set<string>; edgeMetrics: Set<string> }
    ): boolean {
        if (!availableMetricNames || !isMetricSelectionKey(key)) {
            return true
        }
        const metricName = settings[key] ?? ""
        return key === "edgeMetric"
            ? metricName === "" || availableMetricNames.edgeMetrics.has(metricName)
            : availableMetricNames.nodeMetrics.has(metricName)
    }

    private mergePatchesOf(settings: ScenarioSettings, keys: ScenarioSettingKey[]): RecursivePartial<CcState> {
        let merged: RecursivePartial<CcState> = {}
        for (const key of keys) {
            const patch = SCENARIO_SETTINGS[key].patch
            if (patch) {
                merged = mergePatch(merged, patch(settings))
            }
        }
        return merged
    }
}

type PatchRecord = Record<string, unknown>

function mergePatch<T extends PatchRecord>(target: T, source: PatchRecord): T {
    const merged: PatchRecord = { ...target }
    for (const [key, value] of Object.entries(source)) {
        const current = merged[key]
        merged[key] = isMergeableObject(value) && isMergeableObject(current) ? mergePatch({ ...current }, value) : value
    }
    return merged as T
}

function isMergeableObject(value: unknown): value is PatchRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}
