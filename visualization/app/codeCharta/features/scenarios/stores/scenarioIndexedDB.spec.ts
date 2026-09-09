import "fake-indexeddb/auto"

if (typeof globalThis.structuredClone === "undefined") {
    globalThis.structuredClone = <T>(value: T): T => JSON.parse(JSON.stringify(value))
}

import { ColorMode, LabelMode } from "../../../model/codeCharta.model"
import { Scenario } from "../model/scenario.model"
import { ScenarioIndexedDBService } from "./scenarioIndexedDB"

let idCounter = 0

const createTestScenario = (overrides: Partial<Scenario> = {}): Scenario => ({
    id: `test-id-${++idCounter}`,
    name: "Test Scenario",
    createdAt: Date.now(),
    settings: {
        areaMetric: "rloc",
        heightMetric: "mcc",
        colorMetric: "mcc",
        edgeMetric: "pairingRate",
        colorRange: { from: 1, to: 10 },
        colorMode: ColorMode.weightedGradient,
        mapColors: { positive: "#69AE40", neutral: "#ddcc00", negative: "#820E0E" },
        edgeColors: { outgoingEdge: "#FF1D8E", incomingEdge: "#1d8eff" },
        labelMode: LabelMode.Height,
        camera: { position: { x: 0, y: 300, z: 1000 }, target: { x: 0, y: 0, z: 0 } },
        blacklist: [],
        focusedNodePath: []
    },
    ...overrides
})

describe("ScenarioIndexedDBService", () => {
    const service = new ScenarioIndexedDBService()

    describe("readAll", () => {
        it("should return scenarios that were previously added", async () => {
            // Act
            const result = await service.readAll()

            // Assert
            expect(result).toEqual(expect.any(Array))
        })
    })

    describe("add", () => {
        it("should add a scenario and read it back", async () => {
            // Arrange
            const scenario = createTestScenario()

            // Act
            await service.add(scenario)
            const result = await service.readAll()

            // Assert
            expect(result.find(s => s.id === scenario.id)).toEqual(scenario)
        })

        it("should read a scenario stored by an earlier version as settings", async () => {
            // Arrange
            const legacyScenario = {
                id: `legacy-id-${++idCounter}`,
                name: "Legacy Scenario",
                createdAt: Date.now(),
                sections: { metrics: { areaMetric: "rloc", heightMetric: "mcc", colorMetric: "mcc" } }
            }
            await service.add(legacyScenario as unknown as Scenario)

            // Act
            const result = await service.readAll()

            // Assert
            const found = result.find(scenario => scenario.id === legacyScenario.id)
            expect(found?.settings).toEqual({ areaMetric: "rloc", heightMetric: "mcc", colorMetric: "mcc" })
            expect(found).not.toHaveProperty("sections")
        })

        it("should throw when adding a duplicate id", async () => {
            // Arrange
            const scenario = createTestScenario()
            await service.add(scenario)

            // Act & Assert
            await expect(service.add(scenario)).rejects.toThrow()
        })
    })

    describe("delete", () => {
        it("should delete a scenario by id", async () => {
            // Arrange
            const scenario = createTestScenario()
            await service.add(scenario)

            // Act
            await service.delete(scenario.id)
            const result = await service.readAll()

            // Assert
            expect(result.find(s => s.id === scenario.id)).toBeUndefined()
        })
    })

    describe("update", () => {
        it("should update an existing scenario", async () => {
            // Arrange
            const scenario = createTestScenario()
            await service.add(scenario)

            // Act
            const updated = { ...scenario, name: "Updated Scenario" }
            await service.update(updated)
            const result = await service.readAll()

            // Assert
            const found = result.find(s => s.id === scenario.id)
            expect(found).toBeDefined()
            expect(found?.name).toBe("Updated Scenario")
        })
    })
})
