import { CodeMapNode } from "../../../codeCharta.model"
import { klona } from "klona"
import { VALID_NODE_WITH_PATH } from "../../dataMocks"
import House from "./house"
import { Vector2 } from "three"

describe("house", () => {
    let codeMapNode: CodeMapNode
    let house: House
    beforeEach(() => {
        codeMapNode = klona(VALID_NODE_WITH_PATH)
        codeMapNode.path = "somePath"
        house = new House(codeMapNode)
    })
    describe("layout", () => {
        it("should return array of layoutNode", () => {
            const layoutNode: CodeMapNode = {
                ...house["mapNode"],
                value: house["metricValue"],
                rect: house["createMarginatedRectangle"](new Vector2(2, 3)),
                zOffset: 0
            }
            expect(house.layout(1, new Vector2(2, 3))).toEqual([layoutNode])
        })
    })
})
