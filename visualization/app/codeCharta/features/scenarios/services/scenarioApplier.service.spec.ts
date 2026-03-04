import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { State } from "@ngrx/store"
import { Vector3 } from "three"
import { defaultState } from "../../../state/store/state.manager"
import { ThreeCameraService } from "../../../ui/codeMap/threeViewer/threeCamera.service"
import { ThreeMapControlsService } from "../../../ui/codeMap/threeViewer/threeMapControls.service"
import { ThreeRendererService } from "../../../ui/codeMap/threeViewer/threeRenderer.service"
import { setIsLoadingFile } from "../../../state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import { setIsLoadingMap } from "../../../state/store/appSettings/isLoadingMap/isLoadingMap.actions"
import { MetricsSection, Scenario, ScenarioSections, ScenarioSectionKey } from "../model/scenario.model"
import { ScenarioApplierService } from "./scenarioApplier.service"
import { ColorMode, LabelMode, MetricData, RecursivePartial, CcState } from "../../../codeCharta.model"

const testSections: ScenarioSections = {
    metrics: {
        areaMetric: "rloc",
        heightMetric: "mcc",
        colorMetric: "mcc",
        edgeMetric: "pairingRate",
        distributionMetric: "rloc",
        isColorMetricLinkedToHeightMetric: true
    },
    colors: {
        colorRange: { from: 1, to: 10 },
        colorMode: ColorMode.weightedGradient,
        mapColors: {
            positive: "#69AE40",
            neutral: "#ddcc00",
            negative: "#820E0E",
            selected: "#EB8319",
            positiveDelta: "#69FF40",
            negativeDelta: "#ff0E0E",
            base: "#666666",
            flat: "#AAAAAA",
            markingColors: ["#FF1D8E"],
            outgoingEdge: "#FF1D8E",
            incomingEdge: "#1d8eff",
            labelColorAndAlpha: { rgb: "#000000", alpha: 0.7 }
        }
    },
    camera: {
        position: { x: 100, y: 200, z: 300 },
        target: { x: 10, y: 0, z: 20 }
    },
    filters: {
        blacklist: [{ path: "/root/file.ts", type: "exclude" }],
        focusedNodePath: ["/root/src"]
    },
    labelsAndFolders: {
        amountOfTopLabels: 5,
        showMetricLabelNameValue: true,
        showMetricLabelNodeName: false,
        enableFloorLabels: true,
        colorLabels: { positive: true, negative: false, neutral: false },
        labelMode: LabelMode.Color,
        groupLabelCollisions: true,
        markedPackages: [{ path: "/root/src", color: "#FF0000" }]
    }
}

function mergePatches(patches: RecursivePartial<CcState>[]): RecursivePartial<CcState> {
    const merged: RecursivePartial<CcState> = {}
    for (const patch of patches) {
        if (patch.dynamicSettings) {
            merged.dynamicSettings = { ...merged.dynamicSettings, ...patch.dynamicSettings }
        }
        if (patch.appSettings) {
            merged.appSettings = { ...merged.appSettings, ...patch.appSettings }
        }
        if (patch.fileSettings) {
            merged.fileSettings = { ...merged.fileSettings, ...patch.fileSettings }
        }
    }
    return merged
}

const createTestScenario = (): Scenario => ({
    id: "test-id",
    name: "Test",
    createdAt: Date.now(),
    sections: testSections
})

describe("ScenarioApplierService", () => {
    let service: ScenarioApplierService
    let store: MockStore
    let threeCameraService: { camera: { position: Vector3; lookAt: jest.Mock; updateProjectionMatrix: jest.Mock } }
    let threeMapControlsService: { controls: { target: Vector3 }; setControlTarget: jest.Mock; updateControls: jest.Mock }
    let threeRendererService: { render: jest.Mock }

    beforeEach(() => {
        threeCameraService = {
            camera: { position: new Vector3(0, 300, 1000), lookAt: jest.fn(), updateProjectionMatrix: jest.fn() }
        }
        threeMapControlsService = {
            controls: { target: new Vector3(0, 0, 0) },
            setControlTarget: jest.fn(),
            updateControls: jest.fn()
        }
        threeRendererService = { render: jest.fn() }

        TestBed.configureTestingModule({
            providers: [
                provideMockStore({ initialState: defaultState }),
                { provide: State, useValue: { getValue: () => defaultState } },
                { provide: ThreeCameraService, useValue: threeCameraService },
                { provide: ThreeMapControlsService, useValue: threeMapControlsService },
                { provide: ThreeRendererService, useValue: threeRendererService }
            ]
        })

        store = TestBed.inject(MockStore)
        service = TestBed.inject(ScenarioApplierService)
    })

    describe("buildOrderedStatePatches", () => {
        it("should produce metrics patch first when metrics is selected", () => {
            // Arrange
            const keys = new Set<ScenarioSectionKey>(["metrics"])

            // Act
            const patches = service.buildOrderedStatePatches(testSections, keys)

            // Assert
            expect(patches).toHaveLength(1)
            expect(patches[0].dynamicSettings?.areaMetric).toBe("rloc")
            expect(patches[0].dynamicSettings?.heightMetric).toBe("mcc")
            expect(patches[0].appSettings?.isColorMetricLinkedToHeightMetric).toBe(true)
        })

        it("should produce metrics before colors as separate patches", () => {
            // Arrange
            const keys = new Set<ScenarioSectionKey>(["metrics", "colors"])

            // Act
            const patches = service.buildOrderedStatePatches(testSections, keys)

            // Assert — metrics is patch 0, colors is patch 1
            expect(patches).toHaveLength(2)
            expect(patches[0].dynamicSettings?.areaMetric).toBe("rloc")
            expect(patches[0].dynamicSettings?.colorRange).toBeUndefined()
            expect(patches[1].dynamicSettings?.colorRange).toEqual({ from: 1, to: 10 })
            expect(patches[1].appSettings?.mapColors).toEqual(testSections.colors.mapColors)
        })

        it("should apply filters and labels in a third patch", () => {
            // Arrange
            const keys = new Set<ScenarioSectionKey>(["metrics", "colors", "filters", "labelsAndFolders"])

            // Act
            const patches = service.buildOrderedStatePatches(testSections, keys)

            // Assert
            expect(patches).toHaveLength(3)
            expect(patches[2].fileSettings?.blacklist).toEqual(testSections.filters.blacklist)
            expect(patches[2].dynamicSettings?.focusedNodePath).toEqual(["/root/src"])
            expect(patches[2].appSettings?.amountOfTopLabels).toBe(5)
            expect(patches[2].appSettings?.labelMode).toBe(LabelMode.Color)
            expect(patches[2].appSettings?.groupLabelCollisions).toBe(true)
            expect(patches[2].fileSettings?.markedPackages).toEqual(testSections.labelsAndFolders.markedPackages)
        })

        it("should apply all sections correctly when merged", () => {
            // Arrange
            const keys = new Set<ScenarioSectionKey>(["metrics", "colors", "camera", "filters", "labelsAndFolders"])

            // Act
            const patches = service.buildOrderedStatePatches(testSections, keys)
            const merged = mergePatches(patches)

            // Assert
            expect(merged.dynamicSettings?.areaMetric).toBe("rloc")
            expect(merged.dynamicSettings?.colorRange).toEqual({ from: 1, to: 10 })
            expect(merged.fileSettings?.blacklist).toHaveLength(1)
            expect(merged.appSettings?.amountOfTopLabels).toBe(5)
        })

        it("should return empty array when no keys are selected", () => {
            // Arrange
            const keys = new Set<ScenarioSectionKey>()

            // Act
            const patches = service.buildOrderedStatePatches(testSections, keys)

            // Assert
            expect(patches).toHaveLength(0)
        })

        it("should skip unavailable metrics when metricData is provided", () => {
            // Arrange
            const keys = new Set<ScenarioSectionKey>(["metrics"])
            const metricData: MetricData = {
                nodeMetricData: [{ name: "rloc", maxValue: 100, minValue: 0, values: [] }],
                edgeMetricData: []
            }

            // Act
            const patches = service.buildOrderedStatePatches(testSections, keys, metricData)

            // Assert — rloc is available, mcc and pairingRate are not
            expect(patches[0].dynamicSettings?.areaMetric).toBe("rloc")
            expect(patches[0].dynamicSettings?.distributionMetric).toBe("rloc")
            expect(patches[0].dynamicSettings?.heightMetric).toBeUndefined()
            expect(patches[0].dynamicSettings?.colorMetric).toBeUndefined()
            expect(patches[0].dynamicSettings?.edgeMetric).toBeUndefined()
        })

        it("should apply all metrics when metricData is not provided", () => {
            // Arrange
            const keys = new Set<ScenarioSectionKey>(["metrics"])

            // Act
            const patches = service.buildOrderedStatePatches(testSections, keys)

            // Assert
            expect(patches[0].dynamicSettings?.areaMetric).toBe("rloc")
            expect(patches[0].dynamicSettings?.heightMetric).toBe("mcc")
            expect(patches[0].dynamicSettings?.edgeMetric).toBe("pairingRate")
        })

        it("should handle partial metrics section (built-in scenario)", () => {
            // Arrange
            const partialSections: ScenarioSections = {
                metrics: { areaMetric: "rloc", heightMetric: "rloc", colorMetric: "rloc" },
                colors: { colorRange: { from: 250, to: 500 } }
            }
            const keys = new Set<ScenarioSectionKey>(["metrics", "colors"])

            // Act
            const patches = service.buildOrderedStatePatches(partialSections, keys)

            // Assert
            expect(patches).toHaveLength(2)
            expect(patches[0].dynamicSettings?.areaMetric).toBe("rloc")
            expect(patches[0].dynamicSettings?.edgeMetric).toBeUndefined()
            expect(patches[0].dynamicSettings?.distributionMetric).toBeUndefined()
            expect(patches[0].appSettings?.isColorMetricLinkedToHeightMetric).toBeUndefined()
            expect(patches[1].dynamicSettings?.colorRange).toEqual({ from: 250, to: 500 })
            expect(patches[1].dynamicSettings?.colorMode).toBeUndefined()
            expect(patches[1].appSettings).toBeUndefined()
        })

        it("should skip undefined sections even if selected", () => {
            // Arrange
            const partialSections: ScenarioSections = {
                metrics: { areaMetric: "rloc", heightMetric: "rloc", colorMetric: "rloc" }
            }
            const keys = new Set<ScenarioSectionKey>(["metrics", "colors", "camera", "filters", "labelsAndFolders"])

            // Act
            const patches = service.buildOrderedStatePatches(partialSections, keys)

            // Assert — only metrics patch, no colors/filters/labels
            expect(patches).toHaveLength(1)
            expect(patches[0].dynamicSettings?.areaMetric).toBe("rloc")
        })
    })

    describe("getCameraVectors", () => {
        it("should reconstruct Vector3 objects from plain positions", () => {
            // Act
            const result = service.getCameraVectors(testSections)

            // Assert
            expect(result).toBeDefined()
            expect(result?.position.x).toBe(100)
            expect(result?.position.y).toBe(200)
            expect(result?.position.z).toBe(300)
            expect(result?.target.x).toBe(10)
            expect(result?.target.y).toBe(0)
            expect(result?.target.z).toBe(20)
        })

        it("should return undefined when camera section is missing", () => {
            // Arrange
            const noCamera: ScenarioSections = { metrics: testSections.metrics }

            // Act
            const result = service.getCameraVectors(noCamera)

            // Assert
            expect(result).toBeUndefined()
        })
    })

    describe("applyScenario", () => {
        it("should show loading spinner during application and hide it after", async () => {
            // Arrange
            const scenario = createTestScenario()
            const dispatchSpy = jest.spyOn(store, "dispatch")

            // Act
            expect(service.isApplying).toBe(false)
            const promise = service.applyScenario(scenario, new Set<ScenarioSectionKey>(["metrics"]))
            expect(service.isApplying).toBe(true)
            await promise

            // Assert
            expect(service.isApplying).toBe(false)
            expect(dispatchSpy.mock.calls[0][0]).toEqual(setIsLoadingFile({ value: true }))
            expect(dispatchSpy).toHaveBeenCalledWith(setIsLoadingFile({ value: false }))
            expect(dispatchSpy).toHaveBeenCalledWith(setIsLoadingMap({ value: false }))
        })

        it("should dispatch setState for metrics section", async () => {
            // Arrange
            const scenario = createTestScenario()
            const dispatchSpy = jest.spyOn(store, "dispatch")

            // Act
            await service.applyScenario(scenario, new Set<ScenarioSectionKey>(["metrics"]))

            // Assert
            expect(dispatchSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    value: expect.objectContaining({
                        dynamicSettings: expect.objectContaining({
                            areaMetric: scenario.sections.metrics.areaMetric
                        })
                    })
                })
            )
        })

        it("should apply camera position when camera section is selected", async () => {
            // Arrange
            const scenario = createTestScenario()

            // Act
            await service.applyScenario(scenario, new Set<ScenarioSectionKey>(["camera"]))

            // Assert
            expect(threeCameraService.camera.lookAt).toHaveBeenCalled()
            expect(threeCameraService.camera.updateProjectionMatrix).toHaveBeenCalled()
            expect(threeMapControlsService.setControlTarget).toHaveBeenCalled()
            expect(threeMapControlsService.updateControls).toHaveBeenCalled()
        })

        it("should not apply camera when camera section is not selected", async () => {
            // Arrange
            const scenario = createTestScenario()

            // Act
            await service.applyScenario(scenario, new Set<ScenarioSectionKey>(["metrics"]))

            // Assert
            expect(threeCameraService.camera.lookAt).not.toHaveBeenCalled()
        })

        it("should always call render", async () => {
            // Arrange
            const scenario = createTestScenario()

            // Act
            await service.applyScenario(scenario, new Set<ScenarioSectionKey>(["metrics"]))

            // Assert
            expect(threeRendererService.render).toHaveBeenCalled()
        })

        it("should clear isApplying and loading state even when an error occurs during application", async () => {
            // Arrange
            const scenario = createTestScenario()
            threeRendererService.render.mockImplementation(() => {
                throw new Error("render failed")
            })
            const dispatchSpy = jest.spyOn(store, "dispatch")

            // Act
            await expect(service.applyScenario(scenario, new Set<ScenarioSectionKey>(["metrics"]))).rejects.toThrow("render failed")

            // Assert
            expect(service.isApplying).toBe(false)
            expect(dispatchSpy).toHaveBeenCalledWith(setIsLoadingFile({ value: false }))
            expect(dispatchSpy).toHaveBeenCalledWith(setIsLoadingMap({ value: false }))
        })
    })

    describe("getMissingMetrics", () => {
        const metricsSection: MetricsSection = {
            areaMetric: "rloc",
            heightMetric: "mcc",
            colorMetric: "mcc",
            edgeMetric: "pairingRate",
            distributionMetric: "rloc"
        }

        it("should return no missing metrics when all are available", () => {
            // Arrange
            const metricData: MetricData = {
                nodeMetricData: [
                    { name: "rloc", maxValue: 100, minValue: 0, values: [] },
                    { name: "mcc", maxValue: 50, minValue: 0, values: [] }
                ],
                edgeMetricData: [{ name: "pairingRate", maxValue: 1, minValue: 0, values: [] }]
            }

            // Act
            const result = service.getMissingMetrics(metricsSection, metricData)

            // Assert
            expect(result.nodeMetrics).toEqual([])
            expect(result.edgeMetrics).toEqual([])
            expect(service.hasMissingMetrics(result)).toBe(false)
        })

        it("should detect missing node metrics", () => {
            // Arrange
            const metricData: MetricData = {
                nodeMetricData: [{ name: "rloc", maxValue: 100, minValue: 0, values: [] }],
                edgeMetricData: [{ name: "pairingRate", maxValue: 1, minValue: 0, values: [] }]
            }

            // Act
            const result = service.getMissingMetrics(metricsSection, metricData)

            // Assert
            expect(result.nodeMetrics).toEqual(["mcc"])
            expect(service.hasMissingMetrics(result)).toBe(true)
        })

        it("should detect missing edge metrics", () => {
            // Arrange
            const metricData: MetricData = {
                nodeMetricData: [
                    { name: "rloc", maxValue: 100, minValue: 0, values: [] },
                    { name: "mcc", maxValue: 50, minValue: 0, values: [] }
                ],
                edgeMetricData: []
            }

            // Act
            const result = service.getMissingMetrics(metricsSection, metricData)

            // Assert
            expect(result.edgeMetrics).toEqual(["pairingRate"])
            expect(service.hasMissingMetrics(result)).toBe(true)
        })

        it("should deduplicate node metrics that appear in multiple roles", () => {
            // Arrange
            const section: MetricsSection = {
                areaMetric: "rloc",
                heightMetric: "rloc",
                colorMetric: "rloc",
                edgeMetric: "",
                distributionMetric: "rloc"
            }
            const metricData: MetricData = {
                nodeMetricData: [],
                edgeMetricData: []
            }

            // Act
            const result = service.getMissingMetrics(section, metricData)

            // Assert
            expect(result.nodeMetrics).toEqual(["rloc"])
        })

        it("should handle partial metrics section with no optional fields", () => {
            // Arrange
            const section: MetricsSection = {
                areaMetric: "rloc",
                heightMetric: "complexity",
                colorMetric: "complexity"
            }
            const metricData: MetricData = {
                nodeMetricData: [{ name: "rloc", maxValue: 100, minValue: 0, values: [] }],
                edgeMetricData: []
            }

            // Act
            const result = service.getMissingMetrics(section, metricData)

            // Assert
            expect(result.nodeMetrics).toEqual(["complexity"])
            expect(result.edgeMetrics).toEqual([])
        })

        it("should not flag undefined optional metrics as missing", () => {
            // Arrange
            const section: MetricsSection = {
                areaMetric: "rloc",
                heightMetric: "rloc",
                colorMetric: "rloc"
            }
            const metricData: MetricData = {
                nodeMetricData: [{ name: "rloc", maxValue: 100, minValue: 0, values: [] }],
                edgeMetricData: []
            }

            // Act
            const result = service.getMissingMetrics(section, metricData)

            // Assert
            expect(result.nodeMetrics).toEqual([])
            expect(result.edgeMetrics).toEqual([])
            expect(service.hasMissingMetrics(result)).toBe(false)
        })
    })
})
