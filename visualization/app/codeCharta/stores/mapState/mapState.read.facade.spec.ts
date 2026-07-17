import { CcState, ColorMode, LayoutAlgorithm } from "../../model/codeCharta.model"
import { defaultState } from "../rootStore/state.manager"
import {
    areaMetricSelector,
    colorMetricSelector,
    colorModeSelector,
    colorRangeSelector,
    heightMetricSelector,
    hideFlatBuildingsSelector,
    isWhiteBackgroundSelector,
    layoutAlgorithmSelector
} from "./mapState.read.facade"

describe("mapState.read.facade", () => {
    let mockState: CcState

    beforeEach(() => {
        mockState = JSON.parse(JSON.stringify(defaultState))
    })

    describe("areaMetricSelector", () => {
        it("should select areaMetric from mapState", () => {
            // Arrange
            mockState.mapState.areaMetric = "rloc"

            // Act
            const result = areaMetricSelector.projector(mockState.mapState)

            // Assert
            expect(result).toBe("rloc")
        })
    })

    describe("heightMetricSelector", () => {
        it("should select heightMetric from mapState", () => {
            // Arrange
            mockState.mapState.heightMetric = "mcc"

            // Act
            const result = heightMetricSelector.projector(mockState.mapState)

            // Assert
            expect(result).toBe("mcc")
        })
    })

    describe("colorMetricSelector", () => {
        it("should select colorMetric from mapState", () => {
            // Arrange
            mockState.mapState.colorMetric = "complexity"

            // Act
            const result = colorMetricSelector.projector(mockState.mapState)

            // Assert
            expect(result).toBe("complexity")
        })
    })

    describe("colorRangeSelector", () => {
        it("should select colorRange from mapState", () => {
            // Arrange
            mockState.mapState.colorRange = { from: 10, to: 50 }

            // Act
            const result = colorRangeSelector.projector(mockState.mapState)

            // Assert
            expect(result).toEqual({ from: 10, to: 50 })
        })
    })

    describe("colorModeSelector", () => {
        it("should select colorMode from mapState", () => {
            // Arrange
            mockState.mapState.colorMode = ColorMode.absolute

            // Act
            const result = colorModeSelector.projector(mockState.mapState)

            // Assert
            expect(result).toBe(ColorMode.absolute)
        })
    })

    describe("isWhiteBackgroundSelector", () => {
        it("should select isWhiteBackground from mapState", () => {
            // Arrange
            mockState.mapState.isWhiteBackground = true

            // Act
            const result = isWhiteBackgroundSelector.projector(mockState.mapState)

            // Assert
            expect(result).toBe(true)
        })

        it("should return false when isWhiteBackground is false", () => {
            // Arrange
            mockState.mapState.isWhiteBackground = false

            // Act
            const result = isWhiteBackgroundSelector.projector(mockState.mapState)

            // Assert
            expect(result).toBe(false)
        })
    })

    describe("hideFlatBuildingsSelector", () => {
        it("should select hideFlatBuildings from mapState", () => {
            // Arrange
            mockState.mapState.hideFlatBuildings = true

            // Act
            const result = hideFlatBuildingsSelector.projector(mockState.mapState)

            // Assert
            expect(result).toBe(true)
        })

        it("should return false when hideFlatBuildings is false", () => {
            // Arrange
            mockState.mapState.hideFlatBuildings = false

            // Act
            const result = hideFlatBuildingsSelector.projector(mockState.mapState)

            // Assert
            expect(result).toBe(false)
        })
    })

    describe("layoutAlgorithmSelector", () => {
        it("should select layoutAlgorithm from mapState", () => {
            // Arrange
            mockState.mapState.layoutAlgorithm = LayoutAlgorithm.StreetMap

            // Act
            const result = layoutAlgorithmSelector.projector(mockState.mapState)

            // Assert
            expect(result).toBe(LayoutAlgorithm.StreetMap)
        })

        it("should return SquarifiedTreeMap when set to SquarifiedTreeMap", () => {
            // Arrange
            mockState.mapState.layoutAlgorithm = LayoutAlgorithm.SquarifiedTreeMap

            // Act
            const result = layoutAlgorithmSelector.projector(mockState.mapState)

            // Assert
            expect(result).toBe(LayoutAlgorithm.SquarifiedTreeMap)
        })

        it("should return TreeMapStreet when set to TreeMapStreet", () => {
            // Arrange
            mockState.mapState.layoutAlgorithm = LayoutAlgorithm.TreeMapStreet

            // Act
            const result = layoutAlgorithmSelector.projector(mockState.mapState)

            // Assert
            expect(result).toBe(LayoutAlgorithm.TreeMapStreet)
        })
    })
})
