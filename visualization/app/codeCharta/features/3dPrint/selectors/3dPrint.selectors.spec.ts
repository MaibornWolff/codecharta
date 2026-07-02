import { CcState, ColorMode } from "../../../codeCharta.model"
import { defaultState } from "../../../state/store/state.manager"
import {
    areaMetricSelector,
    heightMetricSelector,
    colorMetricSelector,
    colorRangeSelector,
    colorModeSelector,
    attributeDescriptorsSelector,
    blacklistSelector,
    print3DFilesSelector
} from "./3dPrint.selectors"

describe("3dPrint.selectors", () => {
    let mockState: CcState

    beforeEach(() => {
        mockState = JSON.parse(JSON.stringify(defaultState))
    })

    describe("areaMetricSelector", () => {
        it("should select areaMetric from dynamicSettings", () => {
            // Arrange
            mockState.mapState.areaMetric = "rloc"

            // Act
            const result = areaMetricSelector.projector(mockState.mapState)

            // Assert
            expect(result).toBe("rloc")
        })
    })

    describe("heightMetricSelector", () => {
        it("should select heightMetric from dynamicSettings", () => {
            // Arrange
            mockState.mapState.heightMetric = "mcc"

            // Act
            const result = heightMetricSelector.projector(mockState.mapState)

            // Assert
            expect(result).toBe("mcc")
        })
    })

    describe("colorMetricSelector", () => {
        it("should select colorMetric from dynamicSettings", () => {
            // Arrange
            mockState.mapState.colorMetric = "complexity"

            // Act
            const result = colorMetricSelector.projector(mockState.mapState)

            // Assert
            expect(result).toBe("complexity")
        })
    })

    describe("colorRangeSelector", () => {
        it("should select colorRange from dynamicSettings", () => {
            // Arrange
            mockState.mapState.colorRange = { from: 10, to: 50 }

            // Act
            const result = colorRangeSelector.projector(mockState.mapState)

            // Assert
            expect(result).toEqual({ from: 10, to: 50 })
        })
    })

    describe("colorModeSelector", () => {
        it("should select colorMode from dynamicSettings", () => {
            // Arrange
            mockState.mapState.colorMode = ColorMode.absolute

            // Act
            const result = colorModeSelector.projector(mockState.mapState)

            // Assert
            expect(result).toBe(ColorMode.absolute)
        })
    })

    describe("attributeDescriptorsSelector", () => {
        it("should select attributeDescriptors from metricsLensSource", () => {
            // Arrange
            const descriptors = {
                rloc: {
                    title: "Lines of Code",
                    description: "Number of lines",
                    hintLowValue: "Low",
                    hintHighValue: "High",
                    link: ""
                }
            }
            mockState.metricsLensSource.attributeDescriptors = descriptors

            // Act
            const result = attributeDescriptorsSelector.projector(mockState.metricsLensSource)

            // Assert
            expect(result).toEqual(descriptors)
        })
    })

    describe("blacklistSelector", () => {
        it("should select blacklist from sharedView", () => {
            // Arrange
            const blacklist = [{ path: "/test", type: "exclude" as const }]
            mockState.sharedView.blacklist = blacklist

            // Act
            const result = blacklistSelector.projector(mockState.sharedView)

            // Assert
            expect(result).toEqual(blacklist)
        })
    })

    describe("print3DFilesSelector", () => {
        it("should select files from state", () => {
            // Arrange
            const files = mockState.files

            // Act
            const result = print3DFilesSelector.projector(files)

            // Assert
            expect(result).toEqual(files)
        })
    })
})
