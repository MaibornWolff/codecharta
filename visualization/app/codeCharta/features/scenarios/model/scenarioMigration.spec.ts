import { ColorMode, LabelMode } from "../../../model/codeCharta.model"
import { SCENARIO_SCHEMA_VERSION } from "./scenario.model"
import { fromStoredScenario, parseScenarioFile } from "./scenarioMigration"

const legacySections = {
    metrics: {
        areaMetric: "rloc",
        heightMetric: "mcc",
        colorMetric: "mcc",
        edgeMetric: "pairingRate",
        distributionMetric: "rloc",
        isColorMetricLinkedToHeightMetric: true
    },
    colors: {
        colorRange: { from: 1, to: 10 },
        colorMode: ColorMode.weightedGradient,
        mapColors: { positive: "#00FF00", negative: "#FF0000", outgoingEdge: "#FF1D8E", incomingEdge: "#1d8eff" }
    },
    camera: {
        position: { x: 100, y: 200, z: 300 },
        target: { x: 10, y: 0, z: 20 }
    },
    filters: {
        blacklist: [{ path: "/root/file.ts", type: "exclude" }],
        focusedNodePath: ["/root/src"]
    },
    labelsAndFolders: {
        amountOfTopLabels: 5,
        labelSize: 1.5,
        showMetricLabelNameValue: true,
        showMetricLabelNodeName: false,
        enableFloorLabels: true,
        colorLabels: { positive: true, negative: false, neutral: false },
        labelMode: LabelMode.Height,
        groupLabelCollisions: true,
        markedPackages: [{ path: "/root/src", color: "#FF0000" }]
    }
} as const

const legacyStoredScenario = {
    id: "stored-1",
    name: "Stored Scenario",
    description: "From an earlier version",
    createdAt: 1700000000000,
    sections: legacySections
}

describe("scenario migration", () => {
    describe("fromStoredScenario", () => {
        it("should translate the metric sections of a stored scenario into settings", () => {
            // Act
            const { settings } = fromStoredScenario(legacyStoredScenario)

            // Assert
            expect(settings.areaMetric).toBe("rloc")
            expect(settings.heightMetric).toBe("mcc")
            expect(settings.colorMetric).toBe("mcc")
            expect(settings.edgeMetric).toBe("pairingRate")
            expect(settings.isColorMetricLinkedToHeightMetric).toBe(true)
        })

        it("should split stored map colors into band colors and edge colors", () => {
            // Act
            const { settings } = fromStoredScenario(legacyStoredScenario)

            // Assert
            expect(settings.mapColors).toEqual({ positive: "#00FF00", negative: "#FF0000" })
            expect(settings.edgeColors).toEqual({ outgoingEdge: "#FF1D8E", incomingEdge: "#1d8eff" })
        })

        it("should translate camera, filters, and labels of a stored scenario", () => {
            // Act
            const { settings } = fromStoredScenario(legacyStoredScenario)

            // Assert
            expect(settings.camera).toEqual(legacySections.camera)
            expect(settings.excludedNodes).toEqual([{ path: "/root/file.ts", type: "exclude" }])
            expect(settings.focusedNodePath).toEqual(["/root/src"])
            expect(settings.amountOfTopLabels).toBe(5)
            expect(settings.enableFloorLabels).toBe(true)
            expect(settings.markedPackages).toEqual(legacySections.labelsAndFolders.markedPackages)
        })

        it("should drop the distribution metric, which no control can set", () => {
            // Act
            const { settings } = fromStoredScenario(legacyStoredScenario)

            // Assert
            expect(settings).not.toHaveProperty("distributionMetric")
        })

        it("should not invent settings a stored scenario never carried", () => {
            // Act
            const { settings } = fromStoredScenario({ ...legacyStoredScenario, sections: { metrics: { areaMetric: "rloc" } } })

            // Assert
            expect(Object.keys(settings)).toEqual(["areaMetric"])
        })

        it("should keep the metadata of a stored scenario", () => {
            // Act
            const scenario = fromStoredScenario(legacyStoredScenario)

            // Assert
            expect(scenario.id).toBe("stored-1")
            expect(scenario.name).toBe("Stored Scenario")
            expect(scenario.description).toBe("From an earlier version")
            expect(scenario.createdAt).toBe(1700000000000)
            expect(scenario).not.toHaveProperty("sections")
        })

        it("should keep the settings of a scenario stored in the current shape", () => {
            // Arrange
            const stored = { id: "stored-2", name: "Current", createdAt: 1, settings: { margin: 42 } }

            // Act
            const scenario = fromStoredScenario(stored)

            // Assert
            expect(scenario.settings).toEqual({ margin: 42 })
        })
    })

    describe("parseScenarioFile", () => {
        it("should translate a version 1 file into current settings", () => {
            // Act
            const file = parseScenarioFile({ schemaVersion: 1, name: "Old Export", sections: legacySections })

            // Assert
            expect(file?.schemaVersion).toBe(SCENARIO_SCHEMA_VERSION)
            expect(file?.name).toBe("Old Export")
            expect(file?.settings.areaMetric).toBe("rloc")
            expect(file?.settings.camera).toEqual(legacySections.camera)
        })

        it("should accept a file of the current schema version", () => {
            // Act
            const file = parseScenarioFile({
                schemaVersion: SCENARIO_SCHEMA_VERSION,
                name: "New Export",
                mapFileNames: ["project.cc.json"],
                settings: { margin: 20 }
            })

            // Assert
            expect(file?.settings).toEqual({ margin: 20 })
            expect(file?.mapFileNames).toEqual(["project.cc.json"])
        })

        it("should reject a file of an unknown schema version", () => {
            // Act
            const file = parseScenarioFile({ schemaVersion: 99, name: "Future", settings: { margin: 20 } })

            // Assert
            expect(file).toBeUndefined()
        })

        it("should reject a file without a name", () => {
            // Act
            const file = parseScenarioFile({ schemaVersion: SCENARIO_SCHEMA_VERSION, settings: { margin: 20 } })

            // Assert
            expect(file).toBeUndefined()
        })

        it("should reject a file carrying neither settings nor sections", () => {
            // Act
            const file = parseScenarioFile({ schemaVersion: SCENARIO_SCHEMA_VERSION, name: "Empty" })

            // Assert
            expect(file).toBeUndefined()
        })

        it("should reject content that is not an object", () => {
            // Act
            const file = parseScenarioFile("not a scenario")

            // Assert
            expect(file).toBeUndefined()
        })
    })
})

describe("a scenario stored at schema 2", () => {
    it("should split the one rule list it kept into the two the app now keeps", () => {
        // Arrange
        const storedAtSchema2 = {
            schemaVersion: 2,
            name: "stored",
            settings: {
                areaMetric: "rloc",
                blacklist: [
                    { path: "/root/a.ts", type: "exclude" },
                    { path: "/root/b.ts", type: "flatten" }
                ]
            }
        }

        // Act
        const parsed = parseScenarioFile(storedAtSchema2)

        // Assert — dropping the list would silently lose the rules a saved scenario carries
        expect(parsed.settings.excludedNodes).toEqual([{ path: "/root/a.ts" }])
        expect(parsed.settings.flattenedNodes).toEqual([{ path: "/root/b.ts" }])
        expect(parsed.settings).not.toHaveProperty("blacklist")
        expect(parsed.settings.areaMetric).toBe("rloc")
    })

    it("should be rejected when its schema is one this build does not know", () => {
        // Act & Assert
        expect(parseScenarioFile({ schemaVersion: 99, name: "from the future", settings: {} })).toBeUndefined()
    })
})
