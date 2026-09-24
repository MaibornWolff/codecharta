import { ColorMode, RadialFolderStyle } from "../../../model/codeCharta.model"
import { defaultMapColors } from "../../../stores/mapState/store/mapColors/mapColors.reducer"
import { NEUTRAL_FOLDER_COLOR, tintColor } from "../../../util/radialFolderValues"
import { TEST_COLORING } from "../testing/radialChart.stub"
import { nodeColor, RadialColoring, readableTextColor } from "./radialColor"

const FOLDER = "/root/src"

function file(colorValue: number | undefined, isFlat = false) {
    return { path: "/root/a.ts", isFile: true, colorValue, isFlat }
}

function folder(colorValue: number | undefined, isFlat = false) {
    return { path: FOLDER, isFile: false, colorValue, isFlat }
}

function coloringWithFolder(
    folderValue: number | undefined,
    folders: Partial<RadialColoring["folders"]> = {},
    overrides: Partial<RadialColoring> = {}
): RadialColoring {
    const values = new Map(folderValue === undefined ? [] : [[FOLDER, folderValue]])
    return { ...TEST_COLORING, ...overrides, folders: { ...TEST_COLORING.folders, tint: 1, values, ...folders } }
}

describe("nodeColor", () => {
    describe("for files", () => {
        it("should classify a value on the map's colour range unchanged, just like a building", () => {
            // Act
            const colors = [5, 15, 25].map(colorValue => nodeColor(file(colorValue), TEST_COLORING))

            // Assert
            expect(colors).toEqual([defaultMapColors.positive, defaultMapColors.neutral, defaultMapColors.negative])
        })

        it("should use the base colour for a file without a colour value", () => {
            // Act
            const color = nodeColor(file(undefined), TEST_COLORING)

            // Assert
            expect(color).toBe(defaultMapColors.base)
        })

        it("should use the flat colour for a flattened file", () => {
            // Act
            const color = nodeColor(file(25, true), TEST_COLORING)

            // Assert
            expect(color).toBe(defaultMapColors.flat)
        })

        it("should colour every file positive for the unary colour metric", () => {
            // Act
            const color = nodeColor(file(25), { ...TEST_COLORING, isUnaryMetric: true })

            // Assert
            expect(color).toBe(defaultMapColors.positive)
        })

        it("should ignore the folder style", () => {
            // Arrange
            const coloring = coloringWithFolder(25, { style: RadialFolderStyle.Neutral, tint: 0.2 })

            // Act
            const color = nodeColor(file(25), coloring)

            // Assert
            expect(color).toBe(defaultMapColors.negative)
        })
    })

    describe("for folders", () => {
        it("should colour a folder by its folder value on the file thresholds, not by its own colour value", () => {
            // Arrange
            const coloring = coloringWithFolder(15)

            // Act
            const color = nodeColor(folder(500), coloring)

            // Assert
            expect(color).toBe(defaultMapColors.neutral)
        })

        it("should follow the gradient mode for a folder value on the file thresholds", () => {
            // Arrange
            const coloring = coloringWithFolder(12, {}, { colorMode: ColorMode.trueGradient })

            // Act
            const color = nodeColor(folder(1), coloring)

            // Assert
            expect([defaultMapColors.positive, defaultMapColors.neutral]).not.toContain(color)
        })

        it("should mix the value colour toward white by the tint strength", () => {
            // Arrange
            const coloring = coloringWithFolder(25, { tint: 0.5 })

            // Act
            const color = nodeColor(folder(1), coloring)

            // Assert
            expect(color).toBe(tintColor(defaultMapColors.negative, 0.5))
        })

        it("should colour every folder one grey when folders are neutral", () => {
            // Arrange
            const coloring = coloringWithFolder(25, { style: RadialFolderStyle.Neutral })

            // Act
            const color = nodeColor(folder(1), coloring)

            // Assert
            expect(color).toBe(NEUTRAL_FOLDER_COLOR)
        })

        it("should keep the flat colour for a flattened folder", () => {
            // Arrange
            const coloring = coloringWithFolder(25, { style: RadialFolderStyle.Neutral })

            // Act
            const color = nodeColor(folder(1, true), coloring)

            // Assert
            expect(color).toBe(defaultMapColors.flat)
        })

        it("should keep the base colour for a folder without a value", () => {
            // Act
            const colors = [nodeColor(folder(undefined), coloringWithFolder(25)), nodeColor(folder(1), coloringWithFolder(undefined))]

            // Assert
            expect(colors).toEqual([defaultMapColors.base, defaultMapColors.base])
        })

        it("should tint every folder positive for the unary colour metric", () => {
            // Arrange
            const coloring = coloringWithFolder(25, { tint: 0.5 }, { isUnaryMetric: true })

            // Act
            const color = nodeColor(folder(1), coloring)

            // Assert
            expect(color).toBe(tintColor(defaultMapColors.positive, 0.5))
        })
    })
})

describe("readableTextColor", () => {
    it("should pick dark text on a light background", () => {
        // Act
        const color = readableTextColor("#ffff00")

        // Assert
        expect(color).toBe("#1f2937")
    })

    it("should pick light text on a dark background", () => {
        // Act
        const color = readableTextColor("#820e0e")

        // Assert
        expect(color).toBe("#ffffff")
    })
})
