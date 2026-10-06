import { DependencyLeafEdge } from "../../../model/codeCharta.model"
import { anEdge } from "./dependencyGraphTestData"
import { isDashedEdgeType, lineStyleOf, lineStyleOfUsages, PLAIN_LINE, usageLabelOf, usagesOf } from "./lineStyle"

function declarationEdge(usage: string[]): DependencyLeafEdge {
    return { fromNodeName: "/root/a.ts", fromLeaf: "A", toNodeName: "/root/b.ts", toLeaf: "B", attributes: { dependencies: 1 }, usage }
}

function edgeUsedAs(...usagesPerDeclarationEdge: string[][]) {
    return anEdge("/root/a.ts", "/root/b.ts", { declarationEdges: usagesPerDeclarationEdge.map(declarationEdge) })
}

describe("lineStyle", () => {
    describe("lineStyleOf", () => {
        it("should dash only the edge that points upward without closing a cycle while the line style shows the edge type", () => {
            // Arrange
            const upward = anEdge("/root/a.ts", "/root/b.ts", { type: "feedbackContainerLevel" })
            const closingCycle = anEdge("/root/a.ts", "/root/b.ts", { type: "feedbackLeafLevel" })

            // Act
            const styles = [upward, closingCycle].map(edge => lineStyleOf(edge, "edgeType"))

            // Assert
            expect(styles).toEqual([{ dash: [5, 4], head: "filled" }, PLAIN_LINE])
        })

        it("should leave an upward edge solid once the line style shows the kind of use", () => {
            // Arrange
            const upward = anEdge("/root/a.ts", "/root/b.ts", { type: "feedbackContainerLevel" })

            // Act
            const style = lineStyleOf(upward, "usage")

            // Assert
            expect(style).toBe(PLAIN_LINE)
            expect(isDashedEdgeType("feedbackContainerLevel", "usage")).toBe(false)
        })

        it.each([
            [["inheritance"], { dash: null, head: "hollow" }],
            [["implementation"], { dash: [7, 4], head: "hollow" }],
            [["instantiation"], { dash: [7, 4], head: "open" }],
            [["argument"], { dash: [2, 4], head: "open" }],
            [["return_value"], { dash: [9, 3, 2, 3], head: "filled" }],
            [["constant_access"], { dash: null, head: "dot" }],
            [["usage", "argument", "inheritance"], { dash: null, head: "hollow" }],
            [["a_usage_of_tomorrow"], { dash: null, head: "filled" }]
        ])("should draw an edge standing for one dependency used as %j with its strongest tie's dashes and head", (usage, expected) => {
            // Arrange
            const edge = edgeUsedAs(usage)

            // Act
            const style = lineStyleOf(edge, "usage")

            // Assert
            expect(style).toMatchObject(expected)
        })

        it("should keep an edge standing for several dependencies, or for none the map tells, a plain line", () => {
            // Arrange
            const bundle = edgeUsedAs(["inheritance"], ["inheritance"])
            const untold = edgeUsedAs()

            // Act
            const styles = [bundle, untold].map(edge => lineStyleOf(edge, "usage"))

            // Assert
            expect(styles).toEqual([PLAIN_LINE, PLAIN_LINE])
        })
    })

    describe("lineStyleOfUsages", () => {
        it("should draw the strongest of several ways of use, and a way no legend names as a plain line", () => {
            // Act
            const styles = [["usage", "implementation"], ["a_usage_of_tomorrow"], []].map(lineStyleOfUsages)

            // Assert
            expect(styles).toEqual([{ usage: "implementation", label: "Implements", dash: [7, 4], head: "hollow" }, PLAIN_LINE, PLAIN_LINE])
        })
    })

    describe("usagesOf", () => {
        it("should list every way of use once, the strongest tie first and the unknown ones last", () => {
            // Arrange
            const edge = edgeUsedAs(["usage", "zeta", "argument"], ["inheritance", "usage", "alpha"])

            // Act
            const usages = usagesOf(edge)

            // Assert
            expect(usages).toEqual(["inheritance", "argument", "usage", "alpha", "zeta"])
        })
    })

    describe("usageLabelOf", () => {
        it("should name a known way of use by its label and an unknown one by its words", () => {
            // Act
            const labels = ["return_value", "a_usage_of_tomorrow"].map(usageLabelOf)

            // Assert
            expect(labels).toEqual(["Returns", "a usage of tomorrow"])
        })
    })
})
