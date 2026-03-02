import "fake-indexeddb/auto"

if (typeof globalThis.structuredClone === "undefined") {
    globalThis.structuredClone = <T>(value: T): T => JSON.parse(JSON.stringify(value))
}

import { Scenario } from "../model/scenario.model"
import { addScenario, deleteScenario, readAllScenarios, updateScenario } from "./scenarioIndexedDB"

let idCounter = 0

const createTestScenario = (overrides: Partial<Scenario> = {}): Scenario => ({
    id: `test-id-${++idCounter}`,
    name: "Test Scenario",
    createdAt: Date.now(),
    sections: {
        metrics: {
            areaMetric: "rloc",
            heightMetric: "mcc",
            colorMetric: "mcc",
            edgeMetric: "pairingRate",
            distributionMetric: "rloc"
        },
        colors: {
            colorRange: { from: 1, to: 10 },
            colorMode: "weightedGradient" as const,
            mapColors: {
                positive: "#69AE40",
                neutral: "#ddcc00",
                negative: "#820E0E",
                selected: "#EB8319",
                positiveDelta: "#69FF40",
                negativeDelta: "#ff0E0E",
                base: "#666666",
                flat: "#AAAAAA",
                markingColors: ["#FF1D8E", "#1d8eff", "#1DFFFF", "#8eff1d", "#8e1dff"],
                outgoingEdge: "#FF1D8E",
                incomingEdge: "#1d8eff",
                labelColorAndAlpha: { rgb: "#000000", alpha: 0.7 }
            }
        },
        camera: {
            position: { x: 0, y: 300, z: 1000 },
            target: { x: 0, y: 0, z: 0 }
        },
        filters: {
            blacklist: [],
            focusedNodePath: []
        },
        labelsAndFolders: {
            amountOfTopLabels: 1,
            showMetricLabelNameValue: true,
            showMetricLabelNodeName: true,
            enableFloorLabels: false,
            colorLabels: { positive: false, negative: false, neutral: false },
            markedPackages: []
        }
    },
    ...overrides
})

describe("scenarioIndexedDB", () => {
    describe("readAllScenarios", () => {
        it("should return scenarios that were previously added", async () => {
            // Act
            const result = await readAllScenarios()

            // Assert
            expect(result).toEqual(expect.any(Array))
        })
    })

    describe("addScenario", () => {
        it("should add a scenario and read it back", async () => {
            // Arrange
            const scenario = createTestScenario()

            // Act
            await addScenario(scenario)
            const result = await readAllScenarios()

            // Assert
            expect(result.find(s => s.id === scenario.id)).toEqual(scenario)
        })

        it("should throw when adding a duplicate id", async () => {
            // Arrange
            const scenario = createTestScenario()
            await addScenario(scenario)

            // Act & Assert
            await expect(addScenario(scenario)).rejects.toThrow()
        })
    })

    describe("deleteScenario", () => {
        it("should delete a scenario by id", async () => {
            // Arrange
            const scenario = createTestScenario()
            await addScenario(scenario)

            // Act
            await deleteScenario(scenario.id)
            const result = await readAllScenarios()

            // Assert
            expect(result.find(s => s.id === scenario.id)).toBeUndefined()
        })
    })

    describe("updateScenario", () => {
        it("should update an existing scenario", async () => {
            // Arrange
            const scenario = createTestScenario()
            await addScenario(scenario)

            // Act
            const updated = { ...scenario, name: "Updated Scenario" }
            await updateScenario(updated)
            const result = await readAllScenarios()

            // Assert
            const found = result.find(s => s.id === scenario.id)
            expect(found).toBeDefined()
            expect(found!.name).toBe("Updated Scenario")
        })
    })
})
