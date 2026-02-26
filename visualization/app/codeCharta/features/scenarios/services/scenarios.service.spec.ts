import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { State } from "@ngrx/store"
import { defaultState } from "../../../state/store/state.manager"
import { ThreeCameraService } from "../../../ui/codeMap/threeViewer/threeCamera.service"
import { ThreeMapControlsService } from "../../../ui/codeMap/threeViewer/threeMapControls.service"
import { ThreeRendererService } from "../../../ui/codeMap/threeViewer/threeRenderer.service"
import { ScenariosService } from "./scenarios.service"
import { Scenario, ScenarioFile, ScenarioSectionKey } from "../model/scenario.model"
import { FileDownloader } from "../../../util/fileDownloader"
import * as scenarioIndexedDB from "./scenarioIndexedDB"
import { BUILT_IN_SCENARIOS } from "./builtInScenarios"
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
            expect(service.scenarios$.getValue()).toHaveLength(1 + BUILT_IN_SCENARIOS.length)
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
            expect(service.scenarios$.getValue()).toHaveLength(BUILT_IN_SCENARIOS.length)
        })
    })

    describe("loadScenarios", () => {
        it("should include built-in scenarios after user scenarios", async () => {
            // Act
            await service.loadScenarios()

            // Assert
            const scenarios = service.scenarios$.getValue()
            expect(scenarios).toHaveLength(BUILT_IN_SCENARIOS.length)
            expect(scenarios.every(s => s.isBuiltIn)).toBe(true)
        })

        it("should place user scenarios before built-in scenarios", async () => {
            // Arrange
            await service.saveScenario("User Scenario")

            // Act
            await service.loadScenarios()

            // Assert
            const scenarios = service.scenarios$.getValue()
            expect(scenarios).toHaveLength(1 + BUILT_IN_SCENARIOS.length)
            expect(scenarios[0].name).toBe("User Scenario")
            expect(scenarios[0].isBuiltIn).toBeUndefined()
            expect(scenarios[scenarios.length - 1].isBuiltIn).toBe(true)
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

    describe("exportScenario", () => {
        it("should call FileDownloader.downloadData with scenario file JSON", async () => {
            // Arrange
            const scenario = await service.saveScenario("Export Test")
            const downloadSpy = jest.spyOn(FileDownloader, "downloadData").mockImplementation(() => {})

            // Act
            service.exportScenario(scenario)

            // Assert
            expect(downloadSpy).toHaveBeenCalledWith(expect.any(String), "Export_Test.ccscenario")
            const parsed = JSON.parse(downloadSpy.mock.calls[0][0]) as ScenarioFile
            expect(parsed.schemaVersion).toBe(1)
            expect(parsed.name).toBe("Export Test")
            expect(parsed.sections).toBeDefined()
            downloadSpy.mockRestore()
        })

        it("should sanitize the filename", async () => {
            // Arrange
            const scenario = await service.saveScenario("My Scenario (v2)")
            const downloadSpy = jest.spyOn(FileDownloader, "downloadData").mockImplementation(() => {})

            // Act
            service.exportScenario(scenario)

            // Assert
            expect(downloadSpy).toHaveBeenCalledWith(expect.any(String), "My_Scenario__v2_.ccscenario")
            downloadSpy.mockRestore()
        })
    })

    describe("importScenarioFiles", () => {
        function createMockFile(content: string): { text: () => Promise<string> } {
            return { text: () => Promise.resolve(content) }
        }

        function createMockFileList(files: { text: () => Promise<string> }[]): FileList {
            return {
                length: files.length,
                item: (index: number) => files[index],
                [Symbol.iterator]: function* () {
                    yield* files
                }
            } as unknown as FileList
        }

        it("should import valid scenario files and reload", async () => {
            // Arrange
            const scenarioFile: ScenarioFile = {
                schemaVersion: 1,
                name: "Imported",
                sections: { metrics: { areaMetric: "rloc", heightMetric: "mcc", colorMetric: "mcc" } }
            }
            const fileList = createMockFileList([createMockFile(JSON.stringify(scenarioFile))])

            // Act
            const count = await service.importScenarioFiles(fileList)

            // Assert
            expect(count).toBe(1)
            expect(scenarioIndexedDB.addScenario).toHaveBeenCalled()
            expect(scenarioIndexedDB.readAllScenarios).toHaveBeenCalled()
        })

        it("should skip files with invalid schemaVersion", async () => {
            // Arrange
            const fileList = createMockFileList([createMockFile(JSON.stringify({ schemaVersion: 99, name: "Bad", sections: {} }))])

            // Act
            const count = await service.importScenarioFiles(fileList)

            // Assert
            expect(count).toBe(0)
        })

        it("should skip files missing required fields", async () => {
            // Arrange
            const fileList = createMockFileList([
                createMockFile(JSON.stringify({ schemaVersion: 1, sections: {} })),
                createMockFile(JSON.stringify({ schemaVersion: 1, name: "Test" }))
            ])

            // Act
            const count = await service.importScenarioFiles(fileList)

            // Assert
            expect(count).toBe(0)
        })

        it("should import multiple files and return total count", async () => {
            // Arrange
            const fileList = createMockFileList([
                createMockFile(JSON.stringify({ schemaVersion: 1, name: "A", sections: {} })),
                createMockFile(JSON.stringify({ schemaVersion: 1, name: "B", sections: {} }))
            ])

            // Act
            const count = await service.importScenarioFiles(fileList)

            // Assert
            expect(count).toBe(2)
        })

        it("should skip duplicates that match an existing scenario by name and sections", async () => {
            // Arrange
            const sections = { metrics: { areaMetric: "rloc", heightMetric: "mcc", colorMetric: "mcc" } }
            await service.saveScenario("Existing")
            const existingScenario = service.scenarios$.getValue()[0]
            const fileList = createMockFileList([
                createMockFile(JSON.stringify({ schemaVersion: 1, name: existingScenario.name, sections: existingScenario.sections }))
            ])

            // Act
            const count = await service.importScenarioFiles(fileList)

            // Assert
            expect(count).toBe(0)
        })

        it("should import scenario with same name but different sections", async () => {
            // Arrange
            await service.saveScenario("Shared Name")
            const fileList = createMockFileList([
                createMockFile(
                    JSON.stringify({
                        schemaVersion: 1,
                        name: "Shared Name",
                        sections: { metrics: { areaMetric: "different", heightMetric: "different", colorMetric: "different" } }
                    })
                )
            ])

            // Act
            const count = await service.importScenarioFiles(fileList)

            // Assert
            expect(count).toBe(1)
        })

        it("should deduplicate within the same import batch", async () => {
            // Arrange
            const content = JSON.stringify({
                schemaVersion: 1,
                name: "Same",
                sections: { metrics: { areaMetric: "a", heightMetric: "b", colorMetric: "c" } }
            })
            const fileList = createMockFileList([createMockFile(content), createMockFile(content)])

            // Act
            const count = await service.importScenarioFiles(fileList)

            // Assert
            expect(count).toBe(1)
        })
    })
})
