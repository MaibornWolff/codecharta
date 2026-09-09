import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { Vector3 } from "three"
import { ThreeCameraService, ThreeMapControlsService } from "../../../renderer/threeViewer/threeViewer.facade"
import { defaultState } from "../../../stores/rootStore/state.manager"
import { Scenario } from "../model/scenario.model"
import { SCENARIO_SETTING_KEYS, ScenarioSettingKey, ScenarioSettings, ScenarioSettingsSource } from "../model/scenarioSettings.registry"
import { ScenarioIndexedDBService } from "../stores/scenarioIndexedDB"
import { ScenariosService } from "./scenarios.service"

const BUILT_IN_SCENARIO_COUNT = 7
const DEFAULT_MAP_COLORS = {
    positive: "#69AE40",
    neutral: "#ddcc00",
    negative: "#820E0E"
}

const allKeys = new Set<ScenarioSettingKey>(SCENARIO_SETTING_KEYS)
const keysOf = (settings: ScenarioSettings) => Object.keys(settings).sort()

describe("ScenariosService", () => {
    let service: ScenariosService
    let threeCameraService: { camera?: { position: Vector3 } }
    let threeMapControlsService: { controls?: { target: Vector3 } }
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
                storedScenarios = storedScenarios.filter(scenario => scenario.id !== id)
            })
        }

        threeCameraService = { camera: { position: new Vector3(5, 10, 15) } }
        threeMapControlsService = { controls: { target: new Vector3(1, 2, 3) } }

        TestBed.configureTestingModule({
            providers: [
                provideMockStore({ initialState: defaultState }),
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
            const scenario = await service.saveScenario({
                name: "Test Scenario",
                description: "A test description",
                selectedKeys: allKeys
            })

            // Assert
            expect(scenario.name).toBe("Test Scenario")
            expect(scenario.description).toBe("A test description")
            expect(scenario.id).toBeDefined()
            expect(service.scenarios$.getValue()).toHaveLength(1 + BUILT_IN_SCENARIO_COUNT)
        })

        it("should save a scenario with mapFileNames when provided", async () => {
            // Act
            const scenario = await service.saveScenario({
                name: "Bound Scenario",
                mapFileNames: ["project.cc.json", "other.cc.json"],
                selectedKeys: allKeys
            })

            // Assert
            expect(scenario.mapFileNames).toEqual(["project.cc.json", "other.cc.json"])
        })

        it("should save a scenario without mapFileNames by default", async () => {
            // Act
            const scenario = await service.saveScenario({ name: "Global Scenario", selectedKeys: allKeys })

            // Assert
            expect(scenario.mapFileNames).toBeUndefined()
        })

        it("should save only the selected settings", async () => {
            // Act
            const scenario = await service.saveScenario({
                name: "Margin only",
                selectedKeys: new Set<ScenarioSettingKey>(["margin", "invertHeight"])
            })

            // Assert
            expect(keysOf(scenario.settings)).toEqual(["invertHeight", "margin"])
            expect(scenario.settings.margin).toBe(defaultState.mapState.margin)
        })

        it("should read the camera from the camera services", async () => {
            // Act
            const scenario = await service.saveScenario({ name: "With camera", selectedKeys: new Set<ScenarioSettingKey>(["camera"]) })

            // Assert
            expect(scenario.settings.camera).toEqual({ position: { x: 5, y: 10, z: 15 }, target: { x: 1, y: 2, z: 3 } })
        })

        it("should fall back to a default camera when the scene has none yet", async () => {
            // Arrange
            threeCameraService.camera = undefined
            threeMapControlsService.controls = undefined

            // Act
            const scenario = await service.saveScenario({ name: "No scene", selectedKeys: new Set<ScenarioSettingKey>(["camera"]) })

            // Assert
            expect(scenario.settings.camera).toEqual({ position: { x: 0, y: 300, z: 1000 }, target: { x: 0, y: 0, z: 0 } })
        })
    })

    describe("removeScenario", () => {
        it("should keep the scenario list intact when the database rejects a write", async () => {
            // Arrange
            await service.loadScenarios()
            db.add.mockRejectedValueOnce(new Error("database unavailable"))
            db.delete.mockRejectedValueOnce(new Error("database unavailable"))
            jest.spyOn(console, "error").mockImplementation(() => undefined)

            // Act
            const scenario = await service.saveScenario({ name: "Unsaved", selectedKeys: allKeys })
            await service.removeScenario(scenario.id)

            // Assert
            expect(scenario.name).toBe("Unsaved")
            expect(service.scenarios$.getValue()).toHaveLength(BUILT_IN_SCENARIO_COUNT)
        })

        it("should remove a scenario and update the list", async () => {
            // Arrange
            const scenario = await service.saveScenario({ name: "To Delete", selectedKeys: allKeys })

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
            expect(scenarios.every(scenario => scenario.isBuiltIn)).toBe(true)
        })

        it("should place user scenarios before built-in scenarios", async () => {
            // Arrange
            await service.saveScenario({ name: "User Scenario", selectedKeys: allKeys })

            // Act
            await service.loadScenarios()

            // Assert
            const scenarios = service.scenarios$.getValue()
            expect(scenarios).toHaveLength(1 + BUILT_IN_SCENARIO_COUNT)
            expect(scenarios[0].name).toBe("User Scenario")
            expect(scenarios[0].isBuiltIn).toBeUndefined()
            expect(scenarios[scenarios.length - 1].isBuiltIn).toBe(true)
        })

        it("should fall back to built-in scenarios when reading the database fails", async () => {
            // Arrange
            db.readAll.mockRejectedValueOnce(new Error("database unavailable"))
            jest.spyOn(console, "error").mockImplementation(() => undefined)

            // Act
            await service.loadScenarios()

            // Assert
            expect(service.scenarios$.getValue()).toHaveLength(BUILT_IN_SCENARIO_COUNT)
        })
    })

    describe("buildScenario", () => {
        const source: ScenarioSettingsSource = {
            state: defaultState,
            camera: { position: { x: 100, y: 200, z: 300 }, target: { x: 10, y: 0, z: 20 } }
        }

        it("should create a scenario with id, name, and timestamp", () => {
            // Act
            const scenario = service.buildScenario({ name: "My Scenario", description: "A description", selectedKeys: allKeys }, source)

            // Assert
            expect(scenario.id).toBeDefined()
            expect(scenario.name).toBe("My Scenario")
            expect(scenario.description).toBe("A description")
            expect(scenario.createdAt).toBeGreaterThan(0)
            expect(scenario.settings).toBeDefined()
        })

        it("should create unique ids for different scenarios", () => {
            // Act
            const first = service.buildScenario({ name: "Scenario 1", selectedKeys: allKeys }, source)
            const second = service.buildScenario({ name: "Scenario 2", selectedKeys: allKeys }, source)

            // Assert
            expect(first.id).not.toBe(second.id)
        })

        it("should read every setting from the given state and camera", () => {
            // Act
            const { settings } = service.buildScenario({ name: "Everything", selectedKeys: allKeys }, source)

            // Assert
            expect(settings.areaMetric).toBe(defaultState.mapState.areaMetric)
            expect(settings.margin).toBe(defaultState.mapState.margin)
            expect(settings.heightScaling).toBe(defaultState.mapState.scaling.y)
            expect(settings.amountOfEdgePreviews).toBe(defaultState.mapState.amountOfEdgePreviews)
            expect(settings.labelsPerMap).toBe(defaultState.mapState.labelsPerMap)
            expect(settings.camera).toEqual(source.camera)
        })

        it("should split map colors into bands and edge colors", () => {
            // Act
            const { settings } = service.buildScenario({ name: "Colors", selectedKeys: allKeys }, source)

            // Assert
            expect(settings.mapColors).not.toHaveProperty("outgoingEdge")
            expect(settings.mapColors.positive).toBe(defaultState.mapState.mapColors.positive)
            expect(settings.edgeColors).toEqual({
                outgoingEdge: defaultState.mapState.mapColors.outgoingEdge,
                incomingEdge: defaultState.mapState.mapColors.incomingEdge
            })
        })

        it("should leave mapFileNames undefined when not provided", () => {
            // Act
            const scenario = service.buildScenario({ name: "Global Scenario", selectedKeys: allKeys }, source)

            // Assert
            expect(scenario.mapFileNames).toBeUndefined()
        })
    })

    describe("built-in scenarios", () => {
        let builtInScenarios: Scenario[]

        beforeEach(async () => {
            await service.loadScenarios()
            builtInScenarios = service.scenarios$.getValue().filter(scenario => scenario.isBuiltIn)
        })

        it("should have exactly 7 built-in scenarios with unique ids and no timestamp", () => {
            // Assert
            expect(builtInScenarios).toHaveLength(BUILT_IN_SCENARIO_COUNT)
            expect(new Set(builtInScenarios.map(scenario => scenario.id)).size).toBe(BUILT_IN_SCENARIO_COUNT)
            for (const scenario of builtInScenarios) {
                expect(scenario.id).toMatch(/^built-in-/)
                expect(scenario.createdAt).toBe(0)
            }
        })

        it("should carry metric and color settings only", () => {
            // Assert
            for (const scenario of builtInScenarios) {
                expect(keysOf(scenario.settings)).toEqual([
                    "areaMetric",
                    "colorMetric",
                    "colorMode",
                    "colorRange",
                    "heightMetric",
                    "isColorMetricLinkedToHeightMetric",
                    "mapColors"
                ])
            }
        })

        it("should use the default map colors and a weighted gradient for every scenario but Authors", () => {
            // Assert
            for (const scenario of builtInScenarios.filter(scenario => scenario.id !== "built-in-authors")) {
                expect(scenario.settings.colorMode).toBe("weightedGradient")
                expect(scenario.settings.mapColors).toEqual(DEFAULT_MAP_COLORS)
            }
        })

        it("should visualize sonar code smells in the Code Smells scenario", () => {
            // Act
            const codeSmells = builtInScenarios.find(scenario => scenario.id === "built-in-code-smells")

            // Assert
            expect(codeSmells?.settings.areaMetric).toBe("rloc")
            expect(codeSmells?.settings.heightMetric).toBe("sonar_code_smells")
            expect(codeSmells?.settings.colorMetric).toBe("sonar_code_smells")
            expect(codeSmells?.settings.isColorMetricLinkedToHeightMetric).toBe(true)
            expect(codeSmells?.settings.colorRange).toEqual({ from: 10, to: 50 })
        })

        it("should visualize the number of authors with absolute inverted colors in the Authors scenario", () => {
            // Act
            const authors = builtInScenarios.find(scenario => scenario.id === "built-in-authors")

            // Assert
            expect(authors?.name).toBe("Authors")
            expect(authors?.settings.heightMetric).toBe("number_of_authors")
            expect(authors?.settings.colorRange).toEqual({ from: 2, to: 3 })
            expect(authors?.settings.colorMode).toBe("absolute")
            expect(authors?.settings.mapColors).toEqual({
                positive: DEFAULT_MAP_COLORS.negative,
                neutral: DEFAULT_MAP_COLORS.neutral,
                negative: DEFAULT_MAP_COLORS.positive,
                isColorRangeInverted: true
            })
        })
    })
})
