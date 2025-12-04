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
            mockState.dynamicSettings.areaMetric = "rloc"

            // Act
            const result = areaMetricSelector.projector(mockState.dynamicSettings)

            // Assert
            expect(result).toBe("rloc")
        })
    })

    describe("heightMetricSelector", () => {
        it("should select heightMetric from dynamicSettings", () => {
            // Arrange
            mockState.dynamicSettings.heightMetric = "mcc"

            // Act
            const result = heightMetricSelector.projector(mockState.dynamicSettings)

            // Assert
            expect(result).toBe("mcc")
        })
    })

    describe("colorMetricSelector", () => {
        it("should select colorMetric from dynamicSettings", () => {
            // Arrange
            mockState.dynamicSettings.colorMetric = "complexity"

            // Act
            const result = colorMetricSelector.projector(mockState.dynamicSettings)

            // Assert
            expect(result).toBe("complexity")
        })
    })

    describe("colorRangeSelector", () => {
        it("should select colorRange from dynamicSettings", () => {
            // Arrange
            mockState.dynamicSettings.colorRange = { from: 10, to: 50 }

            // Act
            const result = colorRangeSelector.projector(mockState.dynamicSettings)

            // Assert
            expect(result).toEqual({ from: 10, to: 50 })
        })
    })

    describe("colorModeSelector", () => {
        it("should select colorMode from dynamicSettings", () => {
            // Arrange
            mockState.dynamicSettings.colorMode = ColorMode.absolute

            // Act
            const result = colorModeSelector.projector(mockState.dynamicSettings)

            // Assert
            expect(result).toBe(ColorMode.absolute)
        })
    })

    describe("attributeDescriptorsSelector", () => {
        it("should select attributeDescriptors from fileSettings", () => {
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
            mockState.fileSettings.attributeDescriptors = descriptors

            // Act
            const result = attributeDescriptorsSelector.projector(mockState.fileSettings)

            // Assert
            expect(result).toEqual(descriptors)
        })
    })

    describe("blacklistSelector", () => {
        it("should select blacklist from fileSettings", () => {
            // Arrange
            const blacklist = [{ path: "/test", type: "exclude" as const }]
            mockState.fileSettings.blacklist = blacklist

            // Act
            const result = blacklistSelector.projector(mockState.fileSettings)

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
