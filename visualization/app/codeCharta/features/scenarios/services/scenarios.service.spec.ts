import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { defaultState } from "../../../state/store/state.manager"
import { ThreeCameraService } from "../../../ui/codeMap/threeViewer/threeCamera.service"
import { ThreeMapControlsService } from "../../../ui/codeMap/threeViewer/threeMapControls.service"
import { ScenariosService } from "./scenarios.service"
import { PlainPosition, Scenario, ScenarioFile } from "../model/scenario.model"
import { FileDownloader } from "../../../util/fileDownloader"
import { ScenarioIndexedDBService } from "../stores/scenarioIndexedDB"
import { BUILT_IN_SCENARIOS } from "./builtInScenarios"
import { Vector3 } from "three"

describe("ScenariosService", () => {
    let service: ScenariosService
    let threeCameraService: { camera: { position: Vector3 } }
    let threeMapControlsService: { controls: { target: Vector3 } }
    let db: { readAll: jest.Mock; add: jest.Mock; delete: jest.Mock }
    let storedScenarios: Scenario[]

    beforeEach(() => {
        storedScenarios = []
        db = {
            readAll: jest.fn().mockImplementation(async () => [...storedScenarios]),
            add: jest.fn().mockImplementation(async (scenario: Scenario) => {
                storedScenarios.push(scenario)
            }),
            delete: jest.fn().mockImplementation(async (id: string) => {
                storedScenarios = storedScenarios.filter(s => s.id !== id)
            })
        }

        threeCameraService = {
            camera: { position: new Vector3(0, 300, 1000) }
        }
        threeMapControlsService = {
            controls: { target: new Vector3(0, 0, 0) }
        }

        TestBed.configureTestingModule({
            providers: [
                { provide: State, useValue: { getValue: () => defaultState } },
                { provide: ThreeCameraService, useValue: threeCameraService },
                { provide: ThreeMapControlsService, useValue: threeMapControlsService },
                { provide: ScenarioIndexedDBService, useValue: db }
            ]
        })

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
        function createMockFile(content: string, name = "file.ccscenario"): { name: string; text: () => Promise<string> } {
            return { name, text: () => Promise.resolve(content) }
        }

        function createMockFileList(files: { name: string; text: () => Promise<string> }[]): FileList {
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
            const result = await service.importScenarioFiles(fileList)

            // Assert
            expect(result.imported).toBe(1)
            expect(result.duplicates).toEqual([])
            expect(result.invalid).toEqual([])
            expect(result.parseErrors).toEqual([])
            expect(db.add).toHaveBeenCalled()
            expect(db.readAll).toHaveBeenCalled()
        })

        it("should skip files with invalid schemaVersion and report them as invalid", async () => {
            // Arrange
            const fileList = createMockFileList([
                createMockFile(JSON.stringify({ schemaVersion: 99, name: "Bad", sections: {} }), "bad.ccscenario")
            ])

            // Act
            const result = await service.importScenarioFiles(fileList)

            // Assert
            expect(result.imported).toBe(0)
            expect(result.invalid).toEqual(["bad.ccscenario"])
        })

        it("should skip files missing required fields and report them as invalid", async () => {
            // Arrange
            const fileList = createMockFileList([
                createMockFile(JSON.stringify({ schemaVersion: 1, sections: {} }), "no-name.ccscenario"),
                createMockFile(JSON.stringify({ schemaVersion: 1, name: "Test" }), "no-sections.ccscenario")
            ])

            // Act
            const result = await service.importScenarioFiles(fileList)

            // Assert
            expect(result.imported).toBe(0)
            expect(result.invalid).toEqual(["no-name.ccscenario", "no-sections.ccscenario"])
        })

        it("should import multiple files and return total count", async () => {
            // Arrange
            const fileList = createMockFileList([
                createMockFile(JSON.stringify({ schemaVersion: 1, name: "A", sections: {} })),
                createMockFile(JSON.stringify({ schemaVersion: 1, name: "B", sections: {} }))
            ])

            // Act
            const result = await service.importScenarioFiles(fileList)

            // Assert
            expect(result.imported).toBe(2)
        })

        it("should skip duplicates and report them by name", async () => {
            // Arrange
            await service.saveScenario("Existing")
            const existingScenario = service.scenarios$.getValue()[0]
            const fileList = createMockFileList([
                createMockFile(JSON.stringify({ schemaVersion: 1, name: existingScenario.name, sections: existingScenario.sections }))
            ])

            // Act
            const result = await service.importScenarioFiles(fileList)

            // Assert
            expect(result.imported).toBe(0)
            expect(result.duplicates).toEqual(["Existing"])
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
            const result = await service.importScenarioFiles(fileList)

            // Assert
            expect(result.imported).toBe(1)
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
            const result = await service.importScenarioFiles(fileList)

            // Assert
            expect(result.imported).toBe(1)
            expect(result.duplicates).toEqual(["Same"])
        })

        it("should report parse errors for malformed JSON", async () => {
            // Arrange
            const fileList = createMockFileList([createMockFile("not valid json", "broken.json")])

            // Act
            const result = await service.importScenarioFiles(fileList)

            // Assert
            expect(result.imported).toBe(0)
            expect(result.parseErrors).toEqual(["broken.json"])
        })
    })

    describe("buildScenarioSections", () => {
        const cameraPosition: PlainPosition = { x: 100, y: 200, z: 300 }
        const cameraTarget: PlainPosition = { x: 10, y: 0, z: 20 }

        it("should extract metrics section from state", () => {
            // Act
            const sections = service.buildScenarioSections(defaultState, cameraPosition, cameraTarget)

            // Assert
            expect(sections.metrics.areaMetric).toBe(defaultState.dynamicSettings.areaMetric)
            expect(sections.metrics.heightMetric).toBe(defaultState.dynamicSettings.heightMetric)
            expect(sections.metrics.colorMetric).toBe(defaultState.dynamicSettings.colorMetric)
            expect(sections.metrics.edgeMetric).toBe(defaultState.dynamicSettings.edgeMetric)
            expect(sections.metrics.distributionMetric).toBe(defaultState.dynamicSettings.distributionMetric)
        })

        it("should extract colors section from state", () => {
            // Act
            const sections = service.buildScenarioSections(defaultState, cameraPosition, cameraTarget)

            // Assert
            expect(sections.colors.colorRange).toEqual(defaultState.dynamicSettings.colorRange)
            expect(sections.colors.colorMode).toBe(defaultState.dynamicSettings.colorMode)
            expect(sections.colors.mapColors).toEqual(defaultState.appSettings.mapColors)
        })

        it("should extract camera section from provided positions", () => {
            // Act
            const sections = service.buildScenarioSections(defaultState, cameraPosition, cameraTarget)

            // Assert
            expect(sections.camera.position).toEqual(cameraPosition)
            expect(sections.camera.target).toEqual(cameraTarget)
        })

        it("should extract filters section from state", () => {
            // Act
            const sections = service.buildScenarioSections(defaultState, cameraPosition, cameraTarget)

            // Assert
            expect(sections.filters.blacklist).toEqual(defaultState.fileSettings.blacklist)
            expect(sections.filters.focusedNodePath).toEqual(defaultState.dynamicSettings.focusedNodePath)
        })

        it("should extract labelsAndFolders section from state", () => {
            // Act
            const sections = service.buildScenarioSections(defaultState, cameraPosition, cameraTarget)

            // Assert
            expect(sections.labelsAndFolders.amountOfTopLabels).toBe(defaultState.appSettings.amountOfTopLabels)
            expect(sections.labelsAndFolders.markedPackages).toEqual(defaultState.fileSettings.markedPackages)
        })
    })

    describe("buildScenario", () => {
        const cameraPosition: PlainPosition = { x: 100, y: 200, z: 300 }
        const cameraTarget: PlainPosition = { x: 10, y: 0, z: 20 }

        it("should create a scenario with id, name, and timestamp", () => {
            // Act
            const scenario = service.buildScenario("My Scenario", defaultState, cameraPosition, cameraTarget, "A description")

            // Assert
            expect(scenario.id).toBeDefined()
            expect(scenario.name).toBe("My Scenario")
            expect(scenario.description).toBe("A description")
            expect(scenario.createdAt).toBeGreaterThan(0)
            expect(scenario.sections).toBeDefined()
        })

        it("should create unique ids for different scenarios", () => {
            // Act
            const scenario1 = service.buildScenario("Scenario 1", defaultState, cameraPosition, cameraTarget)
            const scenario2 = service.buildScenario("Scenario 2", defaultState, cameraPosition, cameraTarget)

            // Assert
            expect(scenario1.id).not.toBe(scenario2.id)
        })

        it("should include mapFileNames when provided", () => {
            // Act
            const scenario = service.buildScenario("Bound Scenario", defaultState, cameraPosition, cameraTarget, undefined, [
                "project.cc.json",
                "other.cc.json"
            ])

            // Assert
            expect(scenario.mapFileNames).toEqual(["project.cc.json", "other.cc.json"])
        })

        it("should leave mapFileNames undefined when not provided", () => {
            // Act
            const scenario = service.buildScenario("Global Scenario", defaultState, cameraPosition, cameraTarget)

            // Assert
            expect(scenario.mapFileNames).toBeUndefined()
        })
    })
})
