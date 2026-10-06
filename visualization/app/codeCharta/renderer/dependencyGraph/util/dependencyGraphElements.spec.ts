import { atPaintRank, drawnItem, UNTRANSFORMED } from "./dependencyGraphElements"

describe("dependencyGraphElements", () => {
    describe("drawnItem", () => {
        it("should group its children untransformed and keep ECharts' own hover off them", () => {
            // Arrange
            const children = [{ type: "rect" }]

            // Act
            const item = drawnItem(children)

            // Assert
            expect(item).toEqual({ type: "group", ...UNTRANSFORMED, emphasisDisabled: true, children })
        })

        it("should tell ECharts not to merge the children of an item that has none left, so the ones it drew before are removed", () => {
            // Act
            const item = drawnItem([])

            // Assert
            expect(item).toMatchObject({ children: [], $mergeChildren: false })
        })
    })

    describe("atPaintRank", () => {
        it("should pin every child of an item to the item's place in the paint order", () => {
            // Arrange
            const item = drawnItem([{ type: "rect" }, { type: "text" }])

            // Act
            const ranked = atPaintRank(item, 7)

            // Assert
            expect(ranked.children).toEqual([
                { type: "rect", z2: 7 },
                { type: "text", z2: 7 }
            ])
        })
    })
})
