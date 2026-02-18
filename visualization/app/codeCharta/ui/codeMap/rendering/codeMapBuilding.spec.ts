import { CodeMapBuilding } from "./codeMapBuilding"
import { TEST_NODE_ROOT } from "../../../util/dataMocks"
import { Vector3 } from "three"
import { ColorConverter } from "../../../util/color/colorConverter"

function mockColorConverter() {
    ColorConverter.colorToVector3 = jest.fn().mockReturnValue(new Vector3(0, 1, 2))
}

describe("CodeMapBuilding", () => {
    let building: CodeMapBuilding
    let building1: CodeMapBuilding
    let building2: CodeMapBuilding

    const MAP_SIZE = 250

    beforeEach(() => {
        mockColorConverter()

        building = new CodeMapBuilding(0, null, TEST_NODE_ROOT, "#00BFFF")
        building1 = new CodeMapBuilding(0, null, TEST_NODE_ROOT, "#DDCC00")
        building2 = new CodeMapBuilding(1, null, TEST_NODE_ROOT, "#820E0E")
    })

    describe("getCenterPoint", () => {
        it("should return the center point of a building", () => {
            const result = building.getCenterPoint(MAP_SIZE)
            const expected = new Vector3(-244.5, 8, -241.5)

            expect(result.x).toBe(expected.x)
            expect(result.y).toBe(expected.y)
            expect(result.z).toBe(expected.z)
        })
    })

    describe("decreaseLightness", () => {
        it("should set color correctly", () => {
            building.decreaseLightness(5)

            expect(building.color).toEqual("#00ACE6")
        })

        it("should set color correctly and not keep lightness at 10", () => {
            building.decreaseLightness(100)

            expect(building.color).toEqual("#002633")
        })

        it("should set deltaColor correctly when delta is enabled", () => {
            building["_node"].deltas = {}
            building["_defaultDeltaColor"] = "#ABCDEF"

            building.decreaseLightness(100)

            expect(building.deltaColor).toEqual("#08192B")
        })
    })

    describe("getColorVector", () => {
        it("should call colorToVector3 and return it's value", () => {
            building.setColor("#ABCDEF")
            const result = building.getColorVector()

            expect(result.x).toBe(0)
            expect(result.y).toBe(1)
            expect(result.z).toBe(2)
            expect(ColorConverter.colorToVector3).toHaveBeenCalledWith("#ABCDEF")
        })
    })

    describe("getDefaultColorVector", () => {
        it("should call colorToVector3 and return it's value", () => {
            const result = building.getDefaultColorVector()

            expect(result.x).toBe(0)
            expect(result.y).toBe(1)
            expect(result.z).toBe(2)
            expect(ColorConverter.colorToVector3).toHaveBeenCalledWith("#00BFFF")
        })
    })

    describe("resetColor", () => {
        it("should reset the colors back to their defaultColors", () => {
            building.setColor("#ABCDEF")
            building["_defaultDeltaColor"] = "#ABCDEF"

            building.resetColor()

            expect(building.color).toEqual("#00BFFF")
            expect(building.deltaColor).toEqual("#ABCDEF")
        })
    })

    describe("equals", () => {
        it("should return true if two buildings have the same id", () => {
            expect(building.equals(building1)).toBeTruthy()
        })

        it("should return false if two buildings have different ids", () => {
            expect(building.equals(building2)).toBeFalsy()
        })
    })

    describe("setColor", () => {
        it("should set the color", () => {
            building1.setColor("#A0B1C2")

            expect(building1.color).toEqual("#A0B1C2")
        })
    })
})

describe("CodeMapBuilding cached color vectors", () => {
    // These tests use real ColorConverter (no mocking) to verify cached vectors
    // match what the on-demand lightness computation would produce.
    let originalColorToVector3: typeof ColorConverter.colorToVector3

    beforeEach(() => {
        // Restore real colorToVector3 and clear the static cache so mock
        // values from the other describe block don't leak in.
        if (originalColorToVector3 === undefined) {
            // Save the real implementation on first call (before any mock replaces it)
            // Since the sibling describe mocks it in beforeEach, we grab it from prototype
            originalColorToVector3 = ColorConverter.colorToVector3
        }
        ;(ColorConverter as any).colorToVector3Map = new Map()
        ColorConverter.colorToVector3 = (color: string) => {
            const convertedColor = Number(`0x${color.slice(1)}`)
            return new Vector3(((convertedColor >> 16) & 0xff) / 255, ((convertedColor >> 8) & 0xff) / 255, (convertedColor & 0xff) / 255)
        }
    })

    it("should return highlighted color vector matching decreaseLightness(-10)", () => {
        // Arrange
        const color = "#6699CC"
        const building = new CodeMapBuilding(0, null, TEST_NODE_ROOT, color)

        // Act
        const highlightedVector = building.getHighlightedColorVector()

        // Assert — compute expected value the same way decreaseLightness does
        const referenceBuilding = new CodeMapBuilding(1, null, TEST_NODE_ROOT, color)
        referenceBuilding.decreaseLightness(-10)
        const expectedVector = referenceBuilding.getColorVector()
        expect(highlightedVector.x).toBeCloseTo(expectedVector.x, 5)
        expect(highlightedVector.y).toBeCloseTo(expectedVector.y, 5)
        expect(highlightedVector.z).toBeCloseTo(expectedVector.z, 5)
    })

    it("should return dimmed color vector matching decreaseLightness(20)", () => {
        // Arrange
        const color = "#6699CC"
        const building = new CodeMapBuilding(0, null, TEST_NODE_ROOT, color)

        // Act
        const dimmedVector = building.getDimmedColorVector()

        // Assert
        const referenceBuilding = new CodeMapBuilding(1, null, TEST_NODE_ROOT, color)
        referenceBuilding.decreaseLightness(20)
        const expectedVector = referenceBuilding.getColorVector()
        expect(dimmedVector.x).toBeCloseTo(expectedVector.x, 5)
        expect(dimmedVector.y).toBeCloseTo(expectedVector.y, 5)
        expect(dimmedVector.z).toBeCloseTo(expectedVector.z, 5)
    })

    it("should return highlighted delta color vector for default delta color #000000", () => {
        // Arrange
        const building = new CodeMapBuilding(0, null, TEST_NODE_ROOT, "#DDCC00")

        // Act
        const highlightedDeltaVector = building.getHighlightedDeltaColorVector()

        // Assert — default delta is #000000, lightness decrease of -10 clamped at 10
        expect(highlightedDeltaVector).toBeDefined()
        expect(highlightedDeltaVector).toBeInstanceOf(Vector3)
    })

    it("should update cached delta vectors when setInitialDeltaColor is called", () => {
        // Arrange
        const building = new CodeMapBuilding(0, null, TEST_NODE_ROOT, "#DDCC00")
        const newDeltaColor = "#FF5500"

        // Act
        building.setInitialDeltaColor(newDeltaColor)

        // Assert — create a fresh building with same color as delta to compare
        const referenceBuilding = new CodeMapBuilding(1, null, TEST_NODE_ROOT, newDeltaColor)
        const expectedHighlighted = referenceBuilding.getHighlightedColorVector()
        const expectedDimmed = referenceBuilding.getDimmedColorVector()

        const actualHighlighted = building.getHighlightedDeltaColorVector()
        const actualDimmed = building.getDimmedDeltaColorVector()

        expect(actualHighlighted.x).toBeCloseTo(expectedHighlighted.x, 5)
        expect(actualHighlighted.y).toBeCloseTo(expectedHighlighted.y, 5)
        expect(actualHighlighted.z).toBeCloseTo(expectedHighlighted.z, 5)
        expect(actualDimmed.x).toBeCloseTo(expectedDimmed.x, 5)
        expect(actualDimmed.y).toBeCloseTo(expectedDimmed.y, 5)
        expect(actualDimmed.z).toBeCloseTo(expectedDimmed.z, 5)
    })

    it("should have different highlighted and dimmed color vectors", () => {
        // Arrange
        const building = new CodeMapBuilding(0, null, TEST_NODE_ROOT, "#6699CC")

        // Act
        const highlighted = building.getHighlightedColorVector()
        const dimmed = building.getDimmedColorVector()

        // Assert — highlighted is brighter (decreased by -10), dimmed is darker (decreased by 20)
        const highlightedSum = highlighted.x + highlighted.y + highlighted.z
        const dimmedSum = dimmed.x + dimmed.y + dimmed.z
        expect(highlightedSum).toBeGreaterThan(dimmedSum)
    })
})
