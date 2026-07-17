import { Vector2 } from "three"
import Rectangle from "./rectangle"

describe("Rectangle", () => {
    let rectangle1, rectangle2: Rectangle

    beforeEach(() => {
        rectangle1 = new Rectangle(new Vector2(2, 2), 8, 13)
        rectangle2 = new Rectangle(new Vector2(2, 2), 13, 8)
    })
    describe("shorterSide", () => {
        it("should return width when height is longer then width", () => {
            expect(rectangle1.shorterSide()).toBe(8)
        })

        it("should return height when width is longer then height", () => {
            expect(rectangle2.shorterSide()).toBe(8)
        })
    })

    describe("isVertical", () => {
        it("should return true when height is longer then width", () => {
            expect(rectangle1.isVertical()).toBeTruthy()
        })

        it("should return false when width is longer then height", () => {
            expect(rectangle2.isVertical()).toBeFalsy()
        })
    })

    describe("area", () => {
        it("should return correct area", () => {
            expect(rectangle1.area()).toBe(8 * 13)
        })
    })

    describe("getBottomRight", () => {
        it("should return bottom Position", () => {
            expect(rectangle1.getBottomRight().x).toBe(10)
            expect(rectangle1.getBottomRight().y).toBe(15)
        })
    })
})
