import { clippedTo, enclosingRectangle, intersects, Rectangle } from "./geometry"

describe("geometry", () => {
    describe("intersects", () => {
        it("should find overlapping rectangles intersecting", () => {
            // Arrange
            const rectangleA = { x: 0, y: 0, width: 100, height: 50 }
            const rectangleB = { x: 90, y: 40, width: 100, height: 50 }

            // Act
            const intersecting = intersects(rectangleA, rectangleB)

            // Assert
            expect(intersecting).toBe(true)
        })

        it("should not count rectangles that only touch at an edge as intersecting", () => {
            // Arrange
            const rectangleA = { x: 0, y: 0, width: 100, height: 50 }
            const rectangleB = { x: 100, y: 0, width: 100, height: 50 }

            // Act
            const intersecting = intersects(rectangleA, rectangleB)

            // Assert
            expect(intersecting).toBe(false)
        })
    })

    describe("clippedTo", () => {
        const bounds: Rectangle = { x: 0, y: 0, width: 100, height: 80 }

        it("should keep the part of a rectangle within the bounds", () => {
            // Act
            const clipped = clippedTo({ x: 60, y: -10, width: 60, height: 30 }, bounds)

            // Assert
            expect(clipped).toEqual({ x: 60, y: 0, width: 40, height: 20 })
        })

        it("should leave nothing of a rectangle outside the bounds", () => {
            // Act
            const clipped = clippedTo({ x: 100, y: 10, width: 20, height: 20 }, bounds)

            // Assert
            expect(clipped).toBeNull()
        })
    })

    describe("enclosingRectangle", () => {
        it("should enclose every rectangle given", () => {
            // Arrange
            const rectangles = [
                { x: 10, y: 20, width: 30, height: 40 },
                { x: -5, y: 50, width: 10, height: 100 }
            ]

            // Act
            const enclosing = enclosingRectangle(rectangles)

            // Assert
            expect(enclosing).toEqual({ x: -5, y: 20, width: 45, height: 130 })
        })

        it("should enclose nothing in an empty rectangle", () => {
            // Arrange
            const rectangles: Rectangle[] = []

            // Act
            const enclosing = enclosingRectangle(rectangles)

            // Assert
            expect(enclosing).toEqual({ x: 0, y: 0, width: 0, height: 0 })
        })
    })
})
