import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { hasDeclarationsSelector } from "../../../../lenses/dependency/dependencyLens.facade"
import { DependencyGraphSettings } from "../../../../model/dependencyGraph.model"
import { edgeMetricSelector } from "../../../../stores/mapState/mapState.read.facade"
import { defaultDependencyGraphSettings, dependencyGraphSettingsSelector } from "../../../../stores/preferences/preferences.read.facade"
import { DependencyEdgeLegendComponent } from "./dependencyEdgeLegend.component"

interface Setup {
    edgeMetric?: string
    hasDeclarations?: boolean
    settings?: Partial<DependencyGraphSettings>
}

async function renderLegend({ edgeMetric = "dependencies", hasDeclarations = true, settings = {} }: Setup = {}) {
    await render(DependencyEdgeLegendComponent, {
        providers: [
            provideMockStore({
                selectors: [
                    { selector: edgeMetricSelector, value: edgeMetric },
                    { selector: hasDeclarationsSelector, value: hasDeclarations },
                    { selector: dependencyGraphSettingsSelector, value: { ...defaultDependencyGraphSettings, ...settings } }
                ]
            })
        ]
    })
}

function entriesOf(testId: string): string[] {
    return [...screen.getByTestId(testId).querySelectorAll("li")].map(entry => entry.textContent.trim())
}

describe("DependencyEdgeLegendComponent", () => {
    it("should explain the four edge colours of the dependencies, in the colours the reader picked", async () => {
        // Arrange
        const edgeColors = { ...defaultDependencyGraphSettings.edgeColors, cyclic: "#123456" }

        // Act
        await renderLegend({ settings: { edgeColors } })

        // Assert
        const lines = [...screen.getByTestId("dependency-edge-legend").querySelectorAll("line")]
        expect(entriesOf("dependency-edge-legend")).toEqual([
            "Dependency",
            "In a cycle",
            "Points upward",
            "Points upward and closes a cycle"
        ])
        expect(lines.map(line => line.getAttribute("stroke"))).toEqual(["#8c96a3", "#123456", "#dc2626", "#7f1d1d"])
        expect(lines.map(line => line.getAttribute("stroke-dasharray"))).toEqual([null, null, "5 4", null])
    })

    it("should name the only colour another edge metric is drawn in", async () => {
        // Arrange
        const edgeMetric = "temporal_coupling"

        // Act
        await renderLegend({ edgeMetric, settings: { lineStyleShows: "usage" } })

        // Assert
        expect(entriesOf("dependency-edge-legend")).toEqual([edgeMetric])
        expect(screen.queryByTestId("dependency-usage-legend")).toBeNull()
    })

    it("should explain the dashes and arrowheads once the line style shows the kind of use, and dash no edge type then", async () => {
        // Arrange
        const settings = { lineStyleShows: "usage" } as const

        // Act
        await renderLegend({ settings })

        // Assert
        expect(entriesOf("dependency-usage-legend")).toEqual([
            "Inherits",
            "Implements",
            "Creates",
            "Takes as argument",
            "Returns",
            "Reads a constant",
            "Uses"
        ])
        const edgeTypeLines = [...screen.getByTestId("dependency-edge-legend").querySelectorAll("line")]
        expect(edgeTypeLines.every(line => line.getAttribute("stroke-dasharray") === null)).toBe(true)
        expect(screen.getByTestId("dependency-usage-legend").querySelectorAll("polyline, circle")).toHaveLength(3)
    })

    it.each([
        ["icon", "span[aria-hidden]"],
        ["tint", "span[aria-hidden]"],
        ["shape", "svg"]
    ] as const)("should explain the declaration kinds told by %s", async (declarationKindMark, mark) => {
        // Act
        await renderLegend({ settings: { declarationKindMark } })

        // Assert
        const entries = entriesOf("dependency-kind-legend")
        expect(entries.map(entry => entry.replace(/^\S\s*(?=[A-Z])/, ""))).toEqual([
            "Class",
            "Value class",
            "Interface",
            "Annotation",
            "Enum",
            "Function",
            "Variable",
            "Other"
        ])
        expect(screen.getByTestId("dependency-kind-legend").querySelectorAll(`li > ${mark}`)).toHaveLength(8)
    })

    it("should leave the declarations out for a map without any, or when their kind is not shown", async () => {
        // Arrange
        const withoutDeclarations = { hasDeclarations: false, settings: { lineStyleShows: "usage" } } as const

        // Act
        await renderLegend(withoutDeclarations)

        // Assert
        expect(screen.queryByTestId("dependency-kind-legend")).toBeNull()
        expect(screen.queryByTestId("dependency-usage-legend")).toBeNull()
    })

    it("should leave the declaration kinds out when the reader switched them off", async () => {
        // Act
        await renderLegend({ settings: { declarationKindMark: "off" } })

        // Assert
        expect(screen.queryByTestId("dependency-kind-legend")).toBeNull()
    })
})
