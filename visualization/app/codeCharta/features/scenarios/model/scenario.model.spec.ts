import { fromScenarioFile, Scenario, ScenarioFile, toScenarioFile } from "./scenario.model"

describe("scenario file conversion", () => {
    const testScenario: Scenario = {
        id: "abc-123",
        name: "My Scenario",
        description: "A test scenario",
        mapFileNames: ["project.cc.json"],
        createdAt: 1700000000000,
        isBuiltIn: false,
        sections: {
            metrics: { areaMetric: "rloc", heightMetric: "mcc", colorMetric: "mcc" },
            colors: { colorRange: { from: 1, to: 10 } }
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

        it("should set schemaVersion to 1", () => {
            // Act
            const file = toScenarioFile(testScenario)

            // Assert
            expect(file.schemaVersion).toBe(1)
        })

        it("should preserve name, description, mapFileNames, and sections", () => {
            // Act
            const file = toScenarioFile(testScenario)

            // Assert
            expect(file.name).toBe("My Scenario")
            expect(file.description).toBe("A test scenario")
            expect(file.mapFileNames).toEqual(["project.cc.json"])
            expect(file.sections).toEqual(testScenario.sections)
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
            schemaVersion: 1,
            name: "Imported Scenario",
            description: "Imported description",
            mapFileNames: ["file.cc.json"],
            sections: {
                metrics: { areaMetric: "rloc", heightMetric: "mcc", colorMetric: "mcc" }
            }
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

        it("should preserve name, description, mapFileNames, and sections", () => {
            // Act
            const scenario = fromScenarioFile(testFile)

            // Assert
            expect(scenario.name).toBe("Imported Scenario")
            expect(scenario.description).toBe("Imported description")
            expect(scenario.mapFileNames).toEqual(["file.cc.json"])
            expect(scenario.sections).toEqual(testFile.sections)
        })

        it("should not set isBuiltIn", () => {
            // Act
            const scenario = fromScenarioFile(testFile)

            // Assert
            expect(scenario.isBuiltIn).toBeUndefined()
        })

        it("should generate different ids for each call", () => {
            // Act
            const scenario1 = fromScenarioFile(testFile)
            const scenario2 = fromScenarioFile(testFile)

            // Assert
            expect(scenario1.id).not.toBe(scenario2.id)
        })
    })
})
