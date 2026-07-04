import { CodeMapNode } from "../../../codeCharta.model"
import { _valueOf } from "./valueOf.selector"

describe("metrics lens valueOfSelector", () => {
    describe("_valueOf", () => {
        const idToNode = new Map<number, CodeMapNode>([
            [0, { id: 0, attributes: { rloc: 100, mcc: 5 } } as unknown as CodeMapNode],
            [1, { id: 1, attributes: { rloc: 42 } } as unknown as CodeMapNode]
        ])

        it("should return the metric value of the node resolved by id", () => {
            // Arrange
            const lookup = _valueOf(idToNode)

            // Act
            const value = lookup(0, "mcc")

            // Assert
            expect(value).toBe(5)
        })

        it("should return undefined when no node has the given id", () => {
            // Arrange
            const lookup = _valueOf(idToNode)

            // Act
            const value = lookup(99, "rloc")

            // Assert
            expect(value).toBeUndefined()
        })

        it("should return undefined when the resolved node has no such metric", () => {
            // Arrange
            const lookup = _valueOf(idToNode)

            // Act
            const value = lookup(1, "mcc")

            // Assert
            expect(value).toBeUndefined()
        })
    })
})
