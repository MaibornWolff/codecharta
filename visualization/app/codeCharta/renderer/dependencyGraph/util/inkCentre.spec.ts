type InkCentre = typeof import("./inkCentre")

interface Ink {
    actualBoundingBoxLeft: number
    actualBoundingBoxRight: number
    actualBoundingBoxAscent: number
    actualBoundingBoxDescent: number
}

/** The module keeps what it measured, so each test loads it anew, measuring on a canvas that tells the given ink. */
async function loadedWith(context: { measureText: jest.Mock } | null): Promise<InkCentre> {
    jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context as never)
    let inkCentre: InkCentre
    await jest.isolateModulesAsync(async () => {
        inkCentre = await import("./inkCentre")
    })
    return inkCentre
}

const measuring = (ink: Partial<Ink>) => ({ measureText: jest.fn(() => ink) })

describe("inkCentreShiftOf", () => {
    afterEach(() => {
        jest.restoreAllMocks()
    })

    it("should move a text by half of what its ink lies off the point a canvas centres it on, at the size it is drawn", async () => {
        // Arrange
        const ink = { actualBoundingBoxLeft: 20, actualBoundingBoxRight: 30, actualBoundingBoxAscent: 40, actualBoundingBoxDescent: 24 }
        const { inkCentreShiftOf } = await loadedWith(measuring(ink))

        // Act
        const shift = inkCentreShiftOf("7", "bold", 10)

        // Assert
        expect(shift).toEqual([-0.5, 0.8])
    })

    it("should measure a text once, whatever size it is drawn at later", async () => {
        // Arrange
        const canvas = measuring({
            actualBoundingBoxLeft: 10,
            actualBoundingBoxRight: 10,
            actualBoundingBoxAscent: 30,
            actualBoundingBoxDescent: 10
        })
        const { inkCentreShiftOf } = await loadedWith(canvas)

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
        ["its ink cannot be measured", measuring({})],
        ["there is no canvas to measure on", null]
    ])("should leave a text where the canvas centres it when %s", async (_, canvas) => {
        // Arrange
        const { inkCentreShiftOf } = await loadedWith(canvas)

        // Act
        const shift = inkCentreShiftOf("7", "bold", 10)

        // Assert
        expect(shift).toEqual([0, 0])
    })
})
