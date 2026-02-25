import { BUILT_IN_SCENARIOS } from "./builtInScenarios"

describe("builtInScenarios", () => {
    it("should have exactly 5 built-in scenarios", () => {
        // Assert
        expect(BUILT_IN_SCENARIOS).toHaveLength(6)
    })

    it("should all have isBuiltIn set to true", () => {
        // Assert
        for (const scenario of BUILT_IN_SCENARIOS) {
            expect(scenario.isBuiltIn).toBe(true)
        }
    })

    it("should all have deterministic ids starting with 'built-in-'", () => {
        // Assert
        for (const scenario of BUILT_IN_SCENARIOS) {
            expect(scenario.id).toMatch(/^built-in-/)
        }
    })

    it("should all have unique ids", () => {
        // Arrange
        const ids = BUILT_IN_SCENARIOS.map(s => s.id)

        // Assert
        expect(new Set(ids).size).toBe(ids.length)
    })

    it("should all have createdAt of 0", () => {
        // Assert
        for (const scenario of BUILT_IN_SCENARIOS) {
            expect(scenario.createdAt).toBe(0)
        }
    })

    it("should all have metrics and colors sections only", () => {
        // Assert
        for (const scenario of BUILT_IN_SCENARIOS) {
            expect(scenario.sections.metrics).toBeDefined()
            expect(scenario.sections.colors).toBeDefined()
            expect(scenario.sections.camera).toBeUndefined()
            expect(scenario.sections.filters).toBeUndefined()
            expect(scenario.sections.labelsAndFolders).toBeUndefined()
        }
    })

    it("should all have colorRange and mapColors in colors section", () => {
        // Assert
        for (const scenario of BUILT_IN_SCENARIOS) {
            expect(scenario.sections.colors?.colorRange).toBeDefined()
            expect(scenario.sections.colors?.colorMode).toBeUndefined()
            expect(scenario.sections.colors?.mapColors).toEqual({
                positive: "#69AE40",
                neutral: "#ddcc00",
                negative: "#820E0E"
            })
        }
    })

    it("should all have only areaMetric, heightMetric, and colorMetric in metrics section", () => {
        // Assert
        for (const scenario of BUILT_IN_SCENARIOS) {
            expect(scenario.sections.metrics?.areaMetric).toBeDefined()
            expect(scenario.sections.metrics?.heightMetric).toBeDefined()
            expect(scenario.sections.metrics?.colorMetric).toBeDefined()
            expect(scenario.sections.metrics?.edgeMetric).toBeUndefined()
            expect(scenario.sections.metrics?.distributionMetric).toBeUndefined()
            expect(scenario.sections.metrics?.isColorMetricLinkedToHeightMetric).toBeUndefined()
        }
    })
})
