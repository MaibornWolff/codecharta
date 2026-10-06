import { AxisWindow, fitWindowOf, windowKeepingInPlace } from "./axisWindow"
import { aBox } from "./dependencyGraphTestData"
import { Rectangle } from "./geometry"

const VIEWPORT = { width: 800, height: 600 }
const SHOWN: AxisWindow = { x: [100, 500], y: [100, 400] }

function rounded({ x, y }: AxisWindow): AxisWindow {
    return { x: [Math.round(x[0]), Math.round(x[1])], y: [Math.round(y[0]), Math.round(y[1])] }
}

describe("windowKeepingInPlace", () => {
    it("should move with the box, at the same scale", () => {
        // Arrange
        const before: Rectangle = { x: 200, y: 150, width: 160, height: 40 }
        const after: Rectangle = { x: 260, y: 180, width: 200, height: 120 }

        // Act
        const kept = windowKeepingInPlace(SHOWN, before, after, VIEWPORT)

        // Assert
        expect(rounded(kept)).toEqual({ x: [160, 560], y: [130, 430] })
    })

    it("should slide over a box that grew out of the window, leaving a margin", () => {
        // Arrange
        const before: Rectangle = { x: 300, y: 200, width: 160, height: 40 }
        const after: Rectangle = { x: 300, y: 200, width: 250, height: 250 }

        // Act
        const kept = windowKeepingInPlace(SHOWN, before, after, VIEWPORT)

        // Assert
        expect(rounded(kept)).toEqual({ x: [162, 562], y: [159, 459] })
    })

    it("should slide back to a box whose corner lay outside the window", () => {
        // Arrange
        const before: Rectangle = { x: 0, y: 0, width: 900, height: 700 }
        const after: Rectangle = { x: 0, y: 0, width: 160, height: 40 }

        // Act
        const kept = windowKeepingInPlace(SHOWN, before, after, VIEWPORT)

        // Assert
        expect(rounded(kept)).toEqual({ x: [-12, 388], y: [-9, 291] })
    })

    it("should fit a box too large for the window", () => {
        // Arrange
        const before: Rectangle = { x: 200, y: 150, width: 160, height: 40 }
        const after: Rectangle = { x: 200, y: 150, width: 2000, height: 900 }

        // Act
        const kept = windowKeepingInPlace(SHOWN, before, after, VIEWPORT)

        // Assert
        expect(kept).toEqual(fitWindowOf({ boxes: [aBox("/root", after)], bands: [], width: 0, height: 0 }, VIEWPORT))
    })
})
