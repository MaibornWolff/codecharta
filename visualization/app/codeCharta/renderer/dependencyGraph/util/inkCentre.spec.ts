import { createInkMeasurer } from "./inkCentre"

interface Ink {
    actualBoundingBoxLeft: number
    actualBoundingBoxRight: number
    actualBoundingBoxAscent: number
    actualBoundingBoxDescent: number
}

function canvasTelling(ink: Partial<Ink>) {
    return {
        measureText: jest.fn(() => ink as TextMetrics),
        font: "",
        textAlign: "start" as CanvasTextAlign,
        textBaseline: "top" as CanvasTextBaseline
    }
}

describe("createInkMeasurer", () => {
    it("should move a text by half of what its ink lies off the point a canvas centres it on, at the size it is drawn", () => {
        // Arrange
        const ink = { actualBoundingBoxLeft: 20, actualBoundingBoxRight: 30, actualBoundingBoxAscent: 40, actualBoundingBoxDescent: 24 }
        const inkCentreShiftOf = createInkMeasurer(canvasTelling(ink))

        // Act
        const shift = inkCentreShiftOf("7", "bold", 10)

        // Assert
        expect(shift).toEqual([-0.5, 0.8])
    })

    it("should measure a text once, whatever size it is drawn at later", () => {
        // Arrange
        const canvas = canvasTelling({
            actualBoundingBoxLeft: 10,
            actualBoundingBoxRight: 10,
            actualBoundingBoxAscent: 30,
            actualBoundingBoxDescent: 10
        })
        const inkCentreShiftOf = createInkMeasurer(canvas)

        // Act
        const shifts = [inkCentreShiftOf("C", "bold", 10), inkCentreShiftOf("C", "bold", 20)]

        // Assert
        expect(shifts).toEqual([
            [0, 1],
            [0, 2]
        ])
        expect(canvas.measureText).toHaveBeenCalledTimes(1)
    })

    it.each([
        ["its ink cannot be measured", canvasTelling({})],
        ["there is no canvas to measure on", null]
    ])("should leave a text where the canvas centres it when %s", (_, canvas) => {
        // Arrange
        const inkCentreShiftOf = createInkMeasurer(canvas)

        // Act
        const shift = inkCentreShiftOf("7", "bold", 10)

        // Assert
        expect(shift).toEqual([0, 0])
    })
})
