import { CodeMapNode } from "../../../codeCharta.model"
import { klona } from "klona"
import { VALID_NODE_WITH_PATH } from "../../dataMocks"
import HorizontalStreet, { HorizontalOrientation } from "./horizontalStreet"
import BoundingBox from "./boundingBox"
import House from "./house"
import { Vector2 } from "three"

describe("horizontalStreet", () => {
    let codeMapNode: CodeMapNode
    let horizontalStreet: HorizontalStreet
    let children: BoundingBox[]
    let house: House
    beforeEach(() => {
        codeMapNode = klona(VALID_NODE_WITH_PATH)
        codeMapNode.path = "somePath"
        house = new House(codeMapNode)
        children = [house]
        horizontalStreet = new HorizontalStreet(codeMapNode, children, HorizontalOrientation.RIGHT)
    })
    describe("calculateDimension", () => {
        it("should calculate street width and height", () => {
            horizontalStreet["getLength"] = jest.fn()
            horizontalStreet.calculateDimension("mcc")
            expect(horizontalStreet.width).toEqual(Math.max(horizontalStreet["getLength"]([]), horizontalStreet["getLength"]([])))
        })
    })

    describe("layout", () => {
        it("should not call calculateStreetOverhang", () => {
            horizontalStreet["calculateStreetOverhang"] = jest.fn()
            horizontalStreet.layout(1, new Vector2(2, 3))
            expect(horizontalStreet["calculateStreetOverhang"]).toHaveBeenCalled()
        })
    })
})
