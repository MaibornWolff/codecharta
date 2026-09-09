import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { UNARY_METRIC } from "../../../util/metric/unaryMetric"
import { metricValuesSelector } from "./metricValues.selector"

const leaf = (name: string, attributes: Record<string, number>): CodeMapNode => ({
    name,
    path: `/root/${name}`,
    type: NodeType.FILE,
    attributes
})

describe("metricValuesSelector", () => {
    it("should collect the values of every metric a file has", () => {
        // Arrange
        const leaves = [leaf("a.ts", { mcc: 3, rloc: 40 }), leaf("b.ts", { mcc: 9 })]

        // Act
        const values = metricValuesSelector.projector(leaves)

        // Assert
        expect(values.get("mcc")).toEqual([3, 9])
        expect(values.get("rloc")).toEqual([40])
    })

    it("should leave out the synthetic unary metric", () => {
        // Arrange
        const leaves = [leaf("a.ts", { [UNARY_METRIC]: 1, mcc: 3 })]

        // Act
        const values = metricValuesSelector.projector(leaves)

        // Assert
        expect(values.has(UNARY_METRIC)).toBe(false)
    })

    it("should contribute nothing for a file without a value", () => {
        // Arrange
        const leaves = [leaf("a.ts", { mcc: 3 }), leaf("b.ts", { rloc: 1 })]

        // Act
        const values = metricValuesSelector.projector(leaves)

        // Assert
        expect(values.get("mcc")).toEqual([3])
    })

    it("should ignore a broken attribute value", () => {
        // Arrange
        const leaves = [leaf("a.ts", { mcc: Number.NaN }), leaf("b.ts", { mcc: 5 })]

        // Act
        const values = metricValuesSelector.projector(leaves)

        // Assert
        expect(values.get("mcc")).toEqual([5])
    })
})
