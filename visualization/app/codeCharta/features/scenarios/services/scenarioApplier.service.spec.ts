import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { Vector3 } from "three"
import { CcState, ColorMode, LabelMode, MetricData, RecursivePartial } from "../../../model/codeCharta.model"
import { ThreeCameraService, ThreeMapControlsService, ThreeRendererService } from "../../../renderer/threeViewer/threeViewer.facade"
import { setIsLoadingFile } from "../../../stores/fileStore/store/isLoadingFile/isLoadingFile.actions"
import { defaultState } from "../../../stores/rootStore/state.manager"
import { isApplyingScenario$ } from "../../../util/busy/isApplyingScenario"
import { Scenario } from "../model/scenario.model"
import { ScenarioSettingKey, ScenarioSettings } from "../model/scenarioSettings.registry"
import { ScenarioApplierService } from "./scenarioApplier.service"

const testSettings: ScenarioSettings = {
    areaMetric: "rloc",
    margin: 30,
    invertArea: true,
    heightMetric: "mcc",
    heightScaling: 3,
    colorMetric: "mcc",
    isColorMetricLinkedToHeightMetric: true,
    colorRange: { from: 1, to: 10 },
    colorMode: ColorMode.weightedGradient,
    mapColors: { positive: "#69AE40", neutral: "#ddcc00", negative: "#820E0E", markingColors: ["#FF1D8E"] },
    markedPackages: [{ path: "/root/src", color: "#FF0000" }],
    edgeMetric: "pairingRate",
    amountOfEdgePreviews: 7,
    edgeHeight: 5,
    showOnlyBuildingsWithEdges: true,
    edgeColors: { outgoingEdge: "#FF1D8E", incomingEdge: "#1d8eff" },
    amountOfTopLabels: 5,
    labelsPerMap: true,
    labelMode: LabelMode.Color,
    groupLabelCollisions: true,
    camera: { position: { x: 100, y: 200, z: 300 }, target: { x: 10, y: 0, z: 20 } },
    blacklist: [{ path: "/root/file.ts", type: "exclude" }],
    focusedNodePath: ["/root/src"]
}

/** The keys the test scenario carries — not every key of the registry. */
const carriedKeys = new Set(Object.keys(testSettings) as ScenarioSettingKey[])

const createTestScenario = (settings: ScenarioSettings = testSettings): Scenario => ({
    id: "test-id",
    name: "Test",
    createdAt: Date.now(),
    settings
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
        it("should patch the metric selections first", () => {
            // Arrange
            const keys = new Set<ScenarioSettingKey>(["areaMetric", "heightMetric", "colorRange"])

            // Act
            const patches = service.buildOrderedStatePatches(testSettings, keys)

            // Assert
            expect(patches).toHaveLength(2)
            expect(patches[0].mapState).toEqual({ areaMetric: "rloc", heightMetric: "mcc" })
            expect(patches[1].mapState).toEqual({ colorRange: { from: 1, to: 10 } })
        })

        it("should patch a single patch when only metric selections are selected", () => {
            // Arrange
            const keys = new Set<ScenarioSettingKey>(["areaMetric", "edgeMetric"])

            // Act
            const patches = service.buildOrderedStatePatches(testSettings, keys)

            // Assert
            expect(patches).toHaveLength(1)
            expect(patches[0].mapState).toEqual({ areaMetric: "rloc", edgeMetric: "pairingRate" })
        })

        it("should patch every selected setting into its state home", () => {
            // Act
            const patches = service.buildOrderedStatePatches(testSettings, carriedKeys)

            // Assert
            const settingsPatch = patches[1]
            expect(settingsPatch.mapState?.margin).toBe(30)
            expect(settingsPatch.mapState?.invertArea).toBe(true)
            expect(settingsPatch.mapState?.scaling).toEqual({ y: 3 })
            expect(settingsPatch.mapState?.amountOfEdgePreviews).toBe(7)
            expect(settingsPatch.mapState?.labelsPerMap).toBe(true)
            expect(settingsPatch.sharedView?.blacklist).toEqual(testSettings.blacklist)
            expect(settingsPatch.sharedView?.markedPackages).toEqual(testSettings.markedPackages)
        })

        it("should patch the color-follows-height link with the metric selections", () => {
            // Arrange — the link makes an effect re-select the color metric, which re-derives the color range
            const keys = new Set<ScenarioSettingKey>(["isColorMetricLinkedToHeightMetric", "colorRange"])

            // Act
            const patches = service.buildOrderedStatePatches(testSettings, keys)

            // Assert
            expect(patches[0].preferences).toEqual({ isColorMetricLinkedToHeightMetric: true })
            expect(patches[1].mapState).toEqual({ colorRange: { from: 1, to: 10 } })
        })

        it("should merge band colors and edge colors into one map colors patch", () => {
            // Arrange
            const keys = new Set<ScenarioSettingKey>(["mapColors", "edgeColors"])

            // Act
            const patches = service.buildOrderedStatePatches(testSettings, keys)

            // Assert
            expect(patches[0].mapState?.mapColors).toEqual({
                positive: "#69AE40",
                neutral: "#ddcc00",
                negative: "#820E0E",
                markingColors: ["#FF1D8E"],
                outgoingEdge: "#FF1D8E",
                incomingEdge: "#1d8eff"
            })
        })

        it("should patch nothing when nothing is selected", () => {
            // Act
            const patches = service.buildOrderedStatePatches(testSettings, new Set<ScenarioSettingKey>())

            // Assert
            expect(patches).toHaveLength(0)
        })

        it("should patch nothing for the camera, which the camera services move", () => {
            // Act
            const patches = service.buildOrderedStatePatches(testSettings, new Set<ScenarioSettingKey>(["camera"]))

            // Assert
            expect(patches).toHaveLength(0)
        })

        it("should skip settings the scenario does not carry", () => {
            // Arrange
            const scenarioSettings: ScenarioSettings = { areaMetric: "rloc" }

            // Act
            const patches = service.buildOrderedStatePatches(scenarioSettings, carriedKeys)

            // Assert
            expect(patches).toHaveLength(1)
            expect(patches[0].mapState).toEqual({ areaMetric: "rloc" })
        })

        it("should skip metrics the current map does not have", () => {
            // Arrange
            const metricData: MetricData = {
                nodeMetricData: [{ name: "rloc", maxValue: 100, minValue: 0, values: [] }],
                edgeMetricData: []
            }

            // Act
            const patches = service.buildOrderedStatePatches(testSettings, carriedKeys, metricData)

            // Assert — rloc is available, mcc and pairingRate are not
            expect(patches[0].mapState).toEqual({ areaMetric: "rloc" })
        })

        it("should apply every metric when the available metrics are unknown", () => {
            // Act
            const patches = service.buildOrderedStatePatches(testSettings, carriedKeys)

            // Assert
            expect(patches[0].mapState).toEqual({
                areaMetric: "rloc",
                heightMetric: "mcc",
                colorMetric: "mcc",
                edgeMetric: "pairingRate"
            })
        })

        it("should apply an empty edge metric, which means no edge metric at all", () => {
            // Arrange
            const metricData: MetricData = { nodeMetricData: [], edgeMetricData: [] }

            // Act
            const patches = service.buildOrderedStatePatches({ edgeMetric: "" }, new Set<ScenarioSettingKey>(["edgeMetric"]), metricData)

            // Assert
            expect(patches[0].mapState).toEqual({ edgeMetric: "" })
        })
    })

    describe("getCameraVectors", () => {
        it("should reconstruct Vector3 objects from plain positions", () => {
            // Act
            const result = service.getCameraVectors(testSettings)

            // Assert
            expect(result?.position.toArray()).toEqual([100, 200, 300])
            expect(result?.target.toArray()).toEqual([10, 0, 20])
        })

        it("should return undefined when the scenario has no camera", () => {
            // Act
            const result = service.getCameraVectors({ areaMetric: "rloc" })

            // Assert
            expect(result).toBeUndefined()
        })
    })

    describe("applyScenario", () => {
        it("should show loading spinner during application and hide it after", async () => {
            // Arrange
            const scenario = createTestScenario()
            const flags: boolean[] = []
            const subscription = isApplyingScenario$.subscribe(value => flags.push(value))

            // Act
            await service.applyScenario(scenario, new Set<ScenarioSettingKey>(["areaMetric"]))
            subscription.unsubscribe()

            // Assert — applying a scenario is not a file load, so it raises its own flag
            expect(flags).toEqual([false, true, false])
        })

        it("should never write the file loading flag, because applying a scenario is not a file load", async () => {
            // Arrange
            const scenario = createTestScenario()
            const dispatchSpy = jest.spyOn(store, "dispatch")

            // Act
            await service.applyScenario(scenario, new Set<ScenarioSettingKey>(["areaMetric"]))

            // Assert
            expect(dispatchSpy).not.toHaveBeenCalledWith(setIsLoadingFile({ value: true }))
            expect(dispatchSpy).not.toHaveBeenCalledWith(setIsLoadingFile({ value: false }))
        })

        it("should dispatch the selected settings as a state patch", async () => {
            // Arrange
            const scenario = createTestScenario()
            const dispatchSpy = jest.spyOn(store, "dispatch")

            // Act
            await service.applyScenario(scenario, new Set<ScenarioSettingKey>(["areaMetric"]))

            // Assert
            expect(dispatchSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    value: expect.objectContaining({
                        mapState: expect.objectContaining({ areaMetric: "rloc" })
                    })
                })
            )
        })

        it("should apply the camera position when the camera is selected", async () => {
            // Arrange
            const scenario = createTestScenario()

            // Act
            await service.applyScenario(scenario, new Set<ScenarioSettingKey>(["camera"]))

            // Assert
            expect(threeCameraService.camera.position.toArray()).toEqual([100, 200, 300])
            expect(threeCameraService.camera.lookAt).toHaveBeenCalled()
            expect(threeCameraService.camera.updateProjectionMatrix).toHaveBeenCalled()
            expect(threeMapControlsService.setControlTarget).toHaveBeenCalled()
            expect(threeMapControlsService.updateControls).toHaveBeenCalled()
        })

        it("should turn the camera reset off while it moves the camera and back on afterwards", async () => {
            // Arrange
            const scenario = createTestScenario()
            const dispatchSpy = jest.spyOn(store, "dispatch")

            // Act
            await service.applyScenario(scenario, new Set<ScenarioSettingKey>(["camera", "margin"]))
            await new Promise<void>(resolve => setTimeout(resolve))

            // Assert — autoFit would otherwise overwrite the camera the scenario carries
            const patches = dispatchSpy.mock.calls.map(([action]) => (action as unknown as { value: RecursivePartial<CcState> }).value)
            expect(patches[0].preferences?.resetCameraIfNewFileIsLoaded).toBe(false)
            expect(patches.at(-1)?.preferences?.resetCameraIfNewFileIsLoaded).toBe(true)
        })

        it("should not apply the camera when it is not selected", async () => {
            // Arrange
            const scenario = createTestScenario()

            // Act
            await service.applyScenario(scenario, new Set<ScenarioSettingKey>(["areaMetric"]))

            // Assert
            expect(threeCameraService.camera.lookAt).not.toHaveBeenCalled()
        })

        it("should always call render", async () => {
            // Arrange
            const scenario = createTestScenario()

            // Act
            await service.applyScenario(scenario, new Set<ScenarioSettingKey>(["areaMetric"]))

            // Assert
            expect(threeRendererService.render).toHaveBeenCalled()
        })

        it("should clear the applying flag even when an error occurs during application", async () => {
            // Arrange
            const scenario = createTestScenario()
            threeRendererService.render.mockImplementation(() => {
                throw new Error("render failed")
            })
            const flags: boolean[] = []
            const subscription = isApplyingScenario$.subscribe(value => flags.push(value))

            // Act
            await expect(service.applyScenario(scenario, new Set<ScenarioSettingKey>(["areaMetric"]))).rejects.toThrow("render failed")
            subscription.unsubscribe()

            // Assert
            expect(flags.at(-1)).toBe(false)
        })
    })

    describe("getMissingMetrics", () => {
        const metricSettings: ScenarioSettings = {
            areaMetric: "rloc",
            heightMetric: "mcc",
            colorMetric: "mcc",
            edgeMetric: "pairingRate"
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
            const result = service.getMissingMetrics(metricSettings, metricData)

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
            const result = service.getMissingMetrics(metricSettings, metricData)

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
            const result = service.getMissingMetrics(metricSettings, metricData)

            // Assert
            expect(result.edgeMetrics).toEqual(["pairingRate"])
            expect(service.hasMissingMetrics(result)).toBe(true)
        })

        it("should deduplicate node metrics that appear in multiple roles", () => {
            // Arrange
            const settings: ScenarioSettings = { areaMetric: "rloc", heightMetric: "rloc", colorMetric: "rloc", edgeMetric: "" }
            const metricData: MetricData = { nodeMetricData: [], edgeMetricData: [] }

            // Act
            const result = service.getMissingMetrics(settings, metricData)

            // Assert
            expect(result.nodeMetrics).toEqual(["rloc"])
            expect(result.edgeMetrics).toEqual([])
        })

        it("should not flag settings a scenario does not carry as missing", () => {
            // Arrange
            const settings: ScenarioSettings = { areaMetric: "rloc" }
            const metricData: MetricData = {
                nodeMetricData: [{ name: "rloc", maxValue: 100, minValue: 0, values: [] }],
                edgeMetricData: []
            }

            // Act
            const result = service.getMissingMetrics(settings, metricData)

            // Assert
            expect(result.nodeMetrics).toEqual([])
            expect(result.edgeMetrics).toEqual([])
            expect(service.hasMissingMetrics(result)).toBe(false)
        })
    })
})
