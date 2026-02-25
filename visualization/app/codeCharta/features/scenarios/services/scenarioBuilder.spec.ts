import { defaultState } from "../../../state/store/state.manager"
import { buildScenario, buildScenarioSections } from "./scenarioBuilder"
import { PlainPosition } from "../model/scenario.model"

describe("scenarioBuilder", () => {
    const cameraPosition: PlainPosition = { x: 100, y: 200, z: 300 }
    const cameraTarget: PlainPosition = { x: 10, y: 0, z: 20 }

    describe("buildScenarioSections", () => {
        it("should extract metrics section from state", () => {
            // Act
            const sections = buildScenarioSections(defaultState, cameraPosition, cameraTarget)

            // Assert
            expect(sections.metrics.areaMetric).toBe(defaultState.dynamicSettings.areaMetric)
            expect(sections.metrics.heightMetric).toBe(defaultState.dynamicSettings.heightMetric)
            expect(sections.metrics.colorMetric).toBe(defaultState.dynamicSettings.colorMetric)
            expect(sections.metrics.edgeMetric).toBe(defaultState.dynamicSettings.edgeMetric)
            expect(sections.metrics.distributionMetric).toBe(defaultState.dynamicSettings.distributionMetric)
        })

        it("should extract colors section from state", () => {
            // Act
            const sections = buildScenarioSections(defaultState, cameraPosition, cameraTarget)

            // Assert
            expect(sections.colors.colorRange).toEqual(defaultState.dynamicSettings.colorRange)
            expect(sections.colors.colorMode).toBe(defaultState.dynamicSettings.colorMode)
            expect(sections.colors.mapColors).toEqual(defaultState.appSettings.mapColors)
        })

        it("should extract camera section from provided positions", () => {
            // Act
            const sections = buildScenarioSections(defaultState, cameraPosition, cameraTarget)

            // Assert
            expect(sections.camera.position).toEqual(cameraPosition)
            expect(sections.camera.target).toEqual(cameraTarget)
        })

        it("should extract filters section from state", () => {
            // Act
            const sections = buildScenarioSections(defaultState, cameraPosition, cameraTarget)

            // Assert
            expect(sections.filters.blacklist).toEqual(defaultState.fileSettings.blacklist)
            expect(sections.filters.focusedNodePath).toEqual(defaultState.dynamicSettings.focusedNodePath)
        })

        it("should extract labelsAndFolders section from state", () => {
            // Act
            const sections = buildScenarioSections(defaultState, cameraPosition, cameraTarget)

            // Assert
            expect(sections.labelsAndFolders.amountOfTopLabels).toBe(defaultState.appSettings.amountOfTopLabels)
            expect(sections.labelsAndFolders.markedPackages).toEqual(defaultState.fileSettings.markedPackages)
        })
    })

    describe("buildScenario", () => {
        it("should create a scenario with id, name, and timestamp", () => {
            // Act
            const scenario = buildScenario("My Scenario", defaultState, cameraPosition, cameraTarget, "A description")

            // Assert
            expect(scenario.id).toBeDefined()
            expect(scenario.name).toBe("My Scenario")
            expect(scenario.description).toBe("A description")
            expect(scenario.createdAt).toBeGreaterThan(0)
            expect(scenario.sections).toBeDefined()
        })

        it("should create unique ids for different scenarios", () => {
            // Act
            const scenario1 = buildScenario("Scenario 1", defaultState, cameraPosition, cameraTarget)
            const scenario2 = buildScenario("Scenario 2", defaultState, cameraPosition, cameraTarget)

            // Assert
            expect(scenario1.id).not.toBe(scenario2.id)
        })

        it("should include mapFileNames when provided", () => {
            // Act
            const scenario = buildScenario("Bound Scenario", defaultState, cameraPosition, cameraTarget, undefined, [
                "project.cc.json",
                "other.cc.json"
            ])

            // Assert
            expect(scenario.mapFileNames).toEqual(["project.cc.json", "other.cc.json"])
        })

        it("should leave mapFileNames undefined when not provided", () => {
            // Act
            const scenario = buildScenario("Global Scenario", defaultState, cameraPosition, cameraTarget)

            // Assert
            expect(scenario.mapFileNames).toBeUndefined()
        })
    })
})
