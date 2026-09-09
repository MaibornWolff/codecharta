import {
    fromScenarioFile,
    getAvailableGroupKeys,
    getAvailableSettingKeys,
    SCENARIO_SCHEMA_VERSION,
    Scenario,
    ScenarioFile,
    toScenarioFile
} from "./scenario.model"

describe("scenario file conversion", () => {
    const testScenario: Scenario = {
        id: "abc-123",
        name: "My Scenario",
        description: "A test scenario",
        mapFileNames: ["project.cc.json"],
        createdAt: 1700000000000,
        isBuiltIn: false,
        settings: {
            areaMetric: "rloc",
            heightMetric: "mcc",
            colorMetric: "mcc",
            colorRange: { from: 1, to: 10 }
        }
    }

    describe("toScenarioFile", () => {
        it("should strip id, createdAt, and isBuiltIn from scenario", () => {
            // Act
            const file = toScenarioFile(testScenario)

            // Assert
            expect(file).not.toHaveProperty("id")
            expect(file).not.toHaveProperty("createdAt")
            expect(file).not.toHaveProperty("isBuiltIn")
        })

        it("should set the current schema version", () => {
            // Act
            const file = toScenarioFile(testScenario)

            // Assert
            expect(file.schemaVersion).toBe(SCENARIO_SCHEMA_VERSION)
        })

        it("should preserve name, description, mapFileNames, and settings", () => {
            // Act
            const file = toScenarioFile(testScenario)

            // Assert
            expect(file.name).toBe("My Scenario")
            expect(file.description).toBe("A test scenario")
            expect(file.mapFileNames).toEqual(["project.cc.json"])
            expect(file.settings).toEqual(testScenario.settings)
        })

        it("should omit description when not present", () => {
            // Arrange
            const scenario: Scenario = { ...testScenario, description: undefined }

            // Act
            const file = toScenarioFile(scenario)

            // Assert
            expect(file.description).toBeUndefined()
        })

        it("should omit mapFileNames when empty", () => {
            // Arrange
            const scenario: Scenario = { ...testScenario, mapFileNames: [] }

            // Act
            const file = toScenarioFile(scenario)

            // Assert
            expect(file.mapFileNames).toBeUndefined()
        })
    })

    describe("fromScenarioFile", () => {
        const testFile: ScenarioFile = {
            schemaVersion: SCENARIO_SCHEMA_VERSION,
            name: "Imported Scenario",
            description: "Imported description",
            mapFileNames: ["file.cc.json"],
            settings: { areaMetric: "rloc", heightMetric: "mcc", colorMetric: "mcc" }
        }

        it("should generate a new id", () => {
            // Act
            const scenario = fromScenarioFile(testFile)

            // Assert
            expect(scenario.id).toBeDefined()
            expect(scenario.id).not.toBe("")
        })

        it("should generate a new createdAt timestamp", () => {
            // Arrange
            const before = Date.now()

            // Act
            const scenario = fromScenarioFile(testFile)

            // Assert
            expect(scenario.createdAt).toBeGreaterThanOrEqual(before)
            expect(scenario.createdAt).toBeLessThanOrEqual(Date.now())
        })

        it("should preserve name, description, mapFileNames, and settings", () => {
            // Act
            const scenario = fromScenarioFile(testFile)

            // Assert
            expect(scenario.name).toBe("Imported Scenario")
            expect(scenario.description).toBe("Imported description")
            expect(scenario.mapFileNames).toEqual(["file.cc.json"])
            expect(scenario.settings).toEqual(testFile.settings)
        })

        it("should not set isBuiltIn", () => {
            // Act
            const scenario = fromScenarioFile(testFile)

            // Assert
            expect(scenario.isBuiltIn).toBeUndefined()
        })

        it("should generate different ids for each call", () => {
            // Act
            const first = fromScenarioFile(testFile)
            const second = fromScenarioFile(testFile)

            // Assert
            expect(first.id).not.toBe(second.id)
        })
    })

    describe("getAvailableSettingKeys", () => {
        it("should list the settings a scenario carries in registry order", () => {
            // Act
            const keys = getAvailableSettingKeys(testScenario)

            // Assert
            expect(keys).toEqual(["areaMetric", "heightMetric", "colorMetric", "colorRange"])
        })

        it("should list nothing for a scenario without settings", () => {
            // Act
            const keys = getAvailableSettingKeys({ ...testScenario, settings: {} })

            // Assert
            expect(keys).toEqual([])
        })
    })

    describe("getAvailableGroupKeys", () => {
        it("should list the groups a scenario has settings for", () => {
            // Act
            const groupKeys = getAvailableGroupKeys(testScenario)

            // Assert
            expect(groupKeys).toEqual(["area", "height", "color"])
        })

        it("should list the camera group for a scenario carrying only a camera", () => {
            // Arrange
            const scenario: Scenario = {
                ...testScenario,
                settings: { camera: { position: { x: 1, y: 2, z: 3 }, target: { x: 0, y: 0, z: 0 } } }
            }

            // Act
            const groupKeys = getAvailableGroupKeys(scenario)

            // Assert
            expect(groupKeys).toEqual(["camera"])
        })
    })
})
