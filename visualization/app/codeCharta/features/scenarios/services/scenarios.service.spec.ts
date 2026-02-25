import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { State } from "@ngrx/store"
import { defaultState } from "../../../state/store/state.manager"
import { ThreeCameraService } from "../../../ui/codeMap/threeViewer/threeCamera.service"
import { ThreeMapControlsService } from "../../../ui/codeMap/threeViewer/threeMapControls.service"
import { ThreeRendererService } from "../../../ui/codeMap/threeViewer/threeRenderer.service"
import { ScenariosService } from "./scenarios.service"
import { Scenario, ScenarioSectionKey } from "../model/scenario.model"
import * as scenarioIndexedDB from "./scenarioIndexedDB"
import { Vector3 } from "three"

jest.mock("./scenarioIndexedDB")

describe("ScenariosService", () => {
    let service: ScenariosService
    let store: MockStore
    let threeCameraService: { camera: { position: Vector3; lookAt: jest.Mock; updateProjectionMatrix: jest.Mock }; setPosition: jest.Mock }
    let threeMapControlsService: { controls: { target: Vector3 }; setControlTarget: jest.Mock; updateControls: jest.Mock }
    let threeRendererService: { render: jest.Mock }
    let storedScenarios: Scenario[]

    beforeEach(() => {
        storedScenarios = []
        ;(scenarioIndexedDB.readAllScenarios as jest.Mock).mockImplementation(async () => [...storedScenarios])
        ;(scenarioIndexedDB.addScenario as jest.Mock).mockImplementation(async (scenario: Scenario) => {
            storedScenarios.push(scenario)
        })
        ;(scenarioIndexedDB.deleteScenario as jest.Mock).mockImplementation(async (id: string) => {
            storedScenarios = storedScenarios.filter(s => s.id !== id)
        })

        threeCameraService = {
            camera: { position: new Vector3(0, 300, 1000), lookAt: jest.fn(), updateProjectionMatrix: jest.fn() },
            setPosition: jest.fn()
        }
        threeMapControlsService = {
            controls: { target: new Vector3(0, 0, 0) },
            setControlTarget: jest.fn(),
            updateControls: jest.fn()
        }
        threeRendererService = {
            render: jest.fn()
        }

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
        service = TestBed.inject(ScenariosService)
    })

    describe("saveScenario", () => {
        it("should save a scenario and update the list", async () => {
            // Act
            const scenario = await service.saveScenario("Test Scenario", "A test description")

            // Assert
            expect(scenario.name).toBe("Test Scenario")
            expect(scenario.description).toBe("A test description")
            expect(scenario.id).toBeDefined()
            expect(service.scenarios$.getValue()).toHaveLength(1)
        })

        it("should save a scenario with mapFileNames when provided", async () => {
            // Act
            const scenario = await service.saveScenario("Bound Scenario", undefined, ["project.cc.json", "other.cc.json"])

            // Assert
            expect(scenario.mapFileNames).toEqual(["project.cc.json", "other.cc.json"])
        })

        it("should save a scenario without mapFileNames by default", async () => {
            // Act
            const scenario = await service.saveScenario("Global Scenario")

            // Assert
            expect(scenario.mapFileNames).toBeUndefined()
        })
    })

    describe("removeScenario", () => {
        it("should remove a scenario and update the list", async () => {
            // Arrange
            const scenario = await service.saveScenario("To Delete")

            // Act
            await service.removeScenario(scenario.id)

            // Assert
            expect(service.scenarios$.getValue()).toHaveLength(0)
        })
    })

    describe("duplicateScenario", () => {
        it("should create a copy with new id and '(copy)' suffix", async () => {
            // Arrange
            const original = await service.saveScenario("Original", "A description", ["project.cc.json"])

            // Act
            const copy = await service.duplicateScenario(original)

            // Assert
            expect(copy.id).not.toBe(original.id)
            expect(copy.name).toBe("Original (copy)")
            expect(copy.createdAt).toBeGreaterThanOrEqual(original.createdAt)
            expect(service.scenarios$.getValue()).toHaveLength(2)
        })

        it("should remove map binding from the copy", async () => {
            // Arrange
            const original = await service.saveScenario("Bound", undefined, ["project.cc.json"])

            // Act
            const copy = await service.duplicateScenario(original)

            // Assert
            expect(original.mapFileNames).toEqual(["project.cc.json"])
            expect(copy.mapFileNames).toBeUndefined()
        })

        it("should create an independent copy of sections", async () => {
            // Arrange
            const original = await service.saveScenario("Original")

            // Act
            const copy = await service.duplicateScenario(original)

            // Assert
            expect(copy.sections).toEqual(original.sections)
            expect(copy.sections).not.toBe(original.sections)
            expect(copy.sections.metrics).not.toBe(original.sections.metrics)
        })
    })

    describe("applyScenario", () => {
        it("should dispatch setState for metrics section", async () => {
            // Arrange
            const scenario = await service.saveScenario("Test")
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
            const scenario = await service.saveScenario("Test")

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
            const scenario = await service.saveScenario("Test")

            // Act
            await service.applyScenario(scenario, new Set<ScenarioSectionKey>(["metrics"]))

            // Assert
            expect(threeCameraService.camera.lookAt).not.toHaveBeenCalled()
        })

        it("should always call render", async () => {
            // Arrange
            const scenario = await service.saveScenario("Test")

            // Act
            await service.applyScenario(scenario, new Set<ScenarioSectionKey>(["metrics"]))

            // Assert
            expect(threeRendererService.render).toHaveBeenCalled()
        })
    })
})
