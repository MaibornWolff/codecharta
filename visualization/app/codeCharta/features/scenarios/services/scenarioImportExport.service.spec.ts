import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { defaultState } from "../../../state/store/state.manager"
import { ThreeCameraService } from "../../../ui/codeMap/threeViewer/threeCamera.service"
import { ThreeMapControlsService } from "../../../ui/codeMap/threeViewer/threeMapControls.service"
import { ScenariosService } from "./scenarios.service"
import { ScenarioImportExportService } from "./scenarioImportExport.service"
import { Scenario, ScenarioFile } from "../model/scenario.model"
import { FileDownloader } from "../../../util/fileDownloader"
import { ScenarioIndexedDBService } from "../stores/scenarioIndexedDB"
import { Vector3 } from "three"

describe("ScenarioImportExportService", () => {
    let service: ScenarioImportExportService
    let scenariosService: ScenariosService
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

        TestBed.configureTestingModule({
            providers: [
                { provide: State, useValue: { getValue: () => defaultState } },
                { provide: ThreeCameraService, useValue: { camera: { position: new Vector3(0, 300, 1000) } } },
                { provide: ThreeMapControlsService, useValue: { controls: { target: new Vector3(0, 0, 0) } } },
                { provide: ScenarioIndexedDBService, useValue: db }
            ]
        })

        scenariosService = TestBed.inject(ScenariosService)
        service = TestBed.inject(ScenarioImportExportService)
    })

    describe("exportScenario", () => {
        it("should call FileDownloader.downloadData with scenario file JSON", async () => {
            // Arrange
            const scenario = await scenariosService.saveScenario("Export Test")
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
            const scenario = await scenariosService.saveScenario("My Scenario (v2)")
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
            await scenariosService.saveScenario("Existing")
            const existingScenario = scenariosService.scenarios$.getValue()[0]
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
            await scenariosService.saveScenario("Shared Name")
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
})
