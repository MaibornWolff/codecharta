import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { defaultState } from "../../../state/store/state.manager"
import { ThreeCameraService } from "../../../ui/codeMap/threeViewer/threeCamera.service"
import { ThreeMapControlsService } from "../../../ui/codeMap/threeViewer/threeMapControls.service"
import { ScenariosService } from "./scenarios.service"
import { PlainPosition, Scenario } from "../model/scenario.model"
import { ScenarioIndexedDBService } from "../stores/scenarioIndexedDB"
import { Vector3 } from "three"

const BUILT_IN_SCENARIO_COUNT = 6

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
            expect(service.scenarios$.getValue()).toHaveLength(1 + BUILT_IN_SCENARIO_COUNT)
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
            expect(service.scenarios$.getValue()).toHaveLength(BUILT_IN_SCENARIO_COUNT)
        })
    })

    describe("loadScenarios", () => {
        it("should include built-in scenarios after user scenarios", async () => {
            // Act
            await service.loadScenarios()

            // Assert
            const scenarios = service.scenarios$.getValue()
            expect(scenarios).toHaveLength(BUILT_IN_SCENARIO_COUNT)
            expect(scenarios.every(s => s.isBuiltIn)).toBe(true)
        })

        it("should place user scenarios before built-in scenarios", async () => {
            // Arrange
            await service.saveScenario("User Scenario")

            // Act
            await service.loadScenarios()

            // Assert
            const scenarios = service.scenarios$.getValue()
            expect(scenarios).toHaveLength(1 + BUILT_IN_SCENARIO_COUNT)
            expect(scenarios[0].name).toBe("User Scenario")
            expect(scenarios[0].isBuiltIn).toBeUndefined()
            expect(scenarios[scenarios.length - 1].isBuiltIn).toBe(true)
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
            expect(sections.labelsAndFolders.labelMode).toBe(defaultState.appSettings.labelMode)
            expect(sections.labelsAndFolders.groupLabelCollisions).toBe(defaultState.appSettings.groupLabelCollisions)
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

    describe("built-in scenarios", () => {
        it("should have exactly 6 built-in scenarios", async () => {
            // Act
            await service.loadScenarios()

            // Assert
            const builtIn = service.scenarios$.getValue().filter(s => s.isBuiltIn)
            expect(builtIn).toHaveLength(6)
        })

        it("should all have isBuiltIn set to true", async () => {
            // Act
            await service.loadScenarios()

            // Assert
            const builtIn = service.scenarios$.getValue().filter(s => s.isBuiltIn)
            for (const scenario of builtIn) {
                expect(scenario.isBuiltIn).toBe(true)
            }
        })

        it("should all have deterministic ids starting with 'built-in-'", async () => {
            // Act
            await service.loadScenarios()

            // Assert
            const builtIn = service.scenarios$.getValue().filter(s => s.isBuiltIn)
            for (const scenario of builtIn) {
                expect(scenario.id).toMatch(/^built-in-/)
            }
        })

        it("should all have unique ids", async () => {
            // Act
            await service.loadScenarios()

            // Assert
            const builtIn = service.scenarios$.getValue().filter(s => s.isBuiltIn)
            const ids = builtIn.map(s => s.id)
            expect(new Set(ids).size).toBe(ids.length)
        })

        it("should all have createdAt of 0", async () => {
            // Act
            await service.loadScenarios()

            // Assert
            const builtIn = service.scenarios$.getValue().filter(s => s.isBuiltIn)
            for (const scenario of builtIn) {
                expect(scenario.createdAt).toBe(0)
            }
        })

        it("should all have metrics and colors sections only", async () => {
            // Act
            await service.loadScenarios()

            // Assert
            const builtIn = service.scenarios$.getValue().filter(s => s.isBuiltIn)
            for (const scenario of builtIn) {
                expect(scenario.sections.metrics).toBeDefined()
                expect(scenario.sections.colors).toBeDefined()
                expect(scenario.sections.camera).toBeUndefined()
                expect(scenario.sections.filters).toBeUndefined()
                expect(scenario.sections.labelsAndFolders).toBeUndefined()
            }
        })

        it("should all have colorRange, colorMode, and mapColors in colors section", async () => {
            // Act
            await service.loadScenarios()

            // Assert
            const builtIn = service.scenarios$.getValue().filter(s => s.isBuiltIn)
            for (const scenario of builtIn) {
                expect(scenario.sections.colors?.colorRange).toBeDefined()
                expect(scenario.sections.colors?.colorMode).toBe("weightedGradient")
                expect(scenario.sections.colors?.mapColors).toEqual({
                    positive: "#69AE40",
                    neutral: "#ddcc00",
                    negative: "#820E0E"
                })
            }
        })

        it("should all have only areaMetric, heightMetric, colorMetric, and linking in metrics section", async () => {
            // Act
            await service.loadScenarios()

            // Assert
            const builtIn = service.scenarios$.getValue().filter(s => s.isBuiltIn)
            for (const scenario of builtIn) {
                expect(scenario.sections.metrics?.areaMetric).toBeDefined()
                expect(scenario.sections.metrics?.heightMetric).toBeDefined()
                expect(scenario.sections.metrics?.colorMetric).toBeDefined()
                expect(scenario.sections.metrics?.edgeMetric).toBeUndefined()
                expect(scenario.sections.metrics?.distributionMetric).toBeUndefined()
                expect(scenario.sections.metrics?.isColorMetricLinkedToHeightMetric).toBe(true)
            }
        })
    })
})
