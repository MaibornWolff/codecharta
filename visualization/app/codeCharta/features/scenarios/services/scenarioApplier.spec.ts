import { ScenarioSections, ScenarioSectionKey } from "../model/scenario.model"
import { buildOrderedStatePatches, getCameraVectors } from "./scenarioApplier"
import { ColorMode, MetricData, RecursivePartial, CcState } from "../../../codeCharta.model"

const testSections: ScenarioSections = {
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
        mapColors: {
            positive: "#69AE40",
            neutral: "#ddcc00",
            negative: "#820E0E",
            selected: "#EB8319",
            positiveDelta: "#69FF40",
            negativeDelta: "#ff0E0E",
            base: "#666666",
            flat: "#AAAAAA",
            markingColors: ["#FF1D8E"],
            outgoingEdge: "#FF1D8E",
            incomingEdge: "#1d8eff",
            labelColorAndAlpha: { rgb: "#000000", alpha: 0.7 }
        }
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
        showMetricLabelNameValue: true,
        showMetricLabelNodeName: false,
        enableFloorLabels: true,
        colorLabels: { positive: true, negative: false, neutral: false },
        markedPackages: [{ path: "/root/src", color: "#FF0000" }]
    }
}

function mergePatches(patches: RecursivePartial<CcState>[]): RecursivePartial<CcState> {
    const merged: RecursivePartial<CcState> = {}
    for (const patch of patches) {
        if (patch.dynamicSettings) {
            merged.dynamicSettings = { ...merged.dynamicSettings, ...patch.dynamicSettings }
        }
        if (patch.appSettings) {
            merged.appSettings = { ...merged.appSettings, ...patch.appSettings }
        }
        if (patch.fileSettings) {
            merged.fileSettings = { ...merged.fileSettings, ...patch.fileSettings }
        }
    }
    return merged
}

describe("scenarioApplier", () => {
    describe("buildOrderedStatePatches", () => {
        it("should produce metrics patch first when metrics is selected", () => {
            // Arrange
            const keys = new Set<ScenarioSectionKey>(["metrics"])

            // Act
            const patches = buildOrderedStatePatches(testSections, keys)

            // Assert
            expect(patches).toHaveLength(1)
            expect(patches[0].dynamicSettings?.areaMetric).toBe("rloc")
            expect(patches[0].dynamicSettings?.heightMetric).toBe("mcc")
            expect(patches[0].appSettings?.isColorMetricLinkedToHeightMetric).toBe(true)
        })

        it("should produce metrics before colors as separate patches", () => {
            // Arrange
            const keys = new Set<ScenarioSectionKey>(["metrics", "colors"])

            // Act
            const patches = buildOrderedStatePatches(testSections, keys)

            // Assert — metrics is patch 0, colors is patch 1
            expect(patches).toHaveLength(2)
            expect(patches[0].dynamicSettings?.areaMetric).toBe("rloc")
            expect(patches[0].dynamicSettings?.colorRange).toBeUndefined()
            expect(patches[1].dynamicSettings?.colorRange).toEqual({ from: 1, to: 10 })
            expect(patches[1].appSettings?.mapColors).toEqual(testSections.colors.mapColors)
        })

        it("should apply filters and labels in a third patch", () => {
            // Arrange
            const keys = new Set<ScenarioSectionKey>(["metrics", "colors", "filters", "labelsAndFolders"])

            // Act
            const patches = buildOrderedStatePatches(testSections, keys)

            // Assert
            expect(patches).toHaveLength(3)
            expect(patches[2].fileSettings?.blacklist).toEqual(testSections.filters.blacklist)
            expect(patches[2].dynamicSettings?.focusedNodePath).toEqual(["/root/src"])
            expect(patches[2].appSettings?.amountOfTopLabels).toBe(5)
            expect(patches[2].fileSettings?.markedPackages).toEqual(testSections.labelsAndFolders.markedPackages)
        })

        it("should apply all sections correctly when merged", () => {
            // Arrange
            const keys = new Set<ScenarioSectionKey>(["metrics", "colors", "camera", "filters", "labelsAndFolders"])

            // Act
            const patches = buildOrderedStatePatches(testSections, keys)
            const merged = mergePatches(patches)

            // Assert
            expect(merged.dynamicSettings?.areaMetric).toBe("rloc")
            expect(merged.dynamicSettings?.colorRange).toEqual({ from: 1, to: 10 })
            expect(merged.fileSettings?.blacklist).toHaveLength(1)
            expect(merged.appSettings?.amountOfTopLabels).toBe(5)
        })

        it("should return empty array when no keys are selected", () => {
            // Act
            const patches = buildOrderedStatePatches(testSections, new Set())

            // Assert
            expect(patches).toHaveLength(0)
        })

        it("should skip unavailable metrics when metricData is provided", () => {
            // Arrange
            const keys = new Set<ScenarioSectionKey>(["metrics"])
            const metricData: MetricData = {
                nodeMetricData: [{ name: "rloc", maxValue: 100, minValue: 0, values: [] }],
                edgeMetricData: []
            }

            // Act
            const patches = buildOrderedStatePatches(testSections, keys, metricData)

            // Assert — rloc is available, mcc and pairingRate are not
            expect(patches[0].dynamicSettings?.areaMetric).toBe("rloc")
            expect(patches[0].dynamicSettings?.distributionMetric).toBe("rloc")
            expect(patches[0].dynamicSettings?.heightMetric).toBeUndefined()
            expect(patches[0].dynamicSettings?.colorMetric).toBeUndefined()
            expect(patches[0].dynamicSettings?.edgeMetric).toBeUndefined()
        })

        it("should apply all metrics when metricData is not provided", () => {
            // Arrange
            const keys = new Set<ScenarioSectionKey>(["metrics"])

            // Act
            const patches = buildOrderedStatePatches(testSections, keys)

            // Assert
            expect(patches[0].dynamicSettings?.areaMetric).toBe("rloc")
            expect(patches[0].dynamicSettings?.heightMetric).toBe("mcc")
            expect(patches[0].dynamicSettings?.edgeMetric).toBe("pairingRate")
        })

        it("should handle partial metrics section (built-in scenario)", () => {
            // Arrange
            const partialSections: ScenarioSections = {
                metrics: { areaMetric: "rloc", heightMetric: "rloc", colorMetric: "rloc" },
                colors: { colorRange: { from: 250, to: 500 } }
            }
            const keys = new Set<ScenarioSectionKey>(["metrics", "colors"])

            // Act
            const patches = buildOrderedStatePatches(partialSections, keys)

            // Assert
            expect(patches).toHaveLength(2)
            expect(patches[0].dynamicSettings?.areaMetric).toBe("rloc")
            expect(patches[0].dynamicSettings?.edgeMetric).toBeUndefined()
            expect(patches[0].dynamicSettings?.distributionMetric).toBeUndefined()
            expect(patches[0].appSettings?.isColorMetricLinkedToHeightMetric).toBeUndefined()
            expect(patches[1].dynamicSettings?.colorRange).toEqual({ from: 250, to: 500 })
            expect(patches[1].dynamicSettings?.colorMode).toBeUndefined()
            expect(patches[1].appSettings).toBeUndefined()
        })

        it("should skip undefined sections even if selected", () => {
            // Arrange
            const partialSections: ScenarioSections = {
                metrics: { areaMetric: "rloc", heightMetric: "rloc", colorMetric: "rloc" }
            }
            const keys = new Set<ScenarioSectionKey>(["metrics", "colors", "camera", "filters", "labelsAndFolders"])

            // Act
            const patches = buildOrderedStatePatches(partialSections, keys)

            // Assert — only metrics patch, no colors/filters/labels
            expect(patches).toHaveLength(1)
            expect(patches[0].dynamicSettings?.areaMetric).toBe("rloc")
        })
    })

    describe("getCameraVectors", () => {
        it("should reconstruct Vector3 objects from plain positions", () => {
            // Act
            const result = getCameraVectors(testSections)

            // Assert
            expect(result).toBeDefined()
            expect(result?.position.x).toBe(100)
            expect(result?.position.y).toBe(200)
            expect(result?.position.z).toBe(300)
            expect(result?.target.x).toBe(10)
            expect(result?.target.y).toBe(0)
            expect(result?.target.z).toBe(20)
        })

        it("should return undefined when camera section is missing", () => {
            // Arrange
            const noCamera: ScenarioSections = { metrics: testSections.metrics }

            // Act
            const result = getCameraVectors(noCamera)

            // Assert
            expect(result).toBeUndefined()
        })
    })
})
