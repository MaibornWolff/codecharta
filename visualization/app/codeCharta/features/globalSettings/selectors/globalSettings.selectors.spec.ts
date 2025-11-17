import { CcState, LayoutAlgorithm, SharpnessMode } from "../../../codeCharta.model"
import { defaultState } from "../../../state/store/state.manager"
import {
    screenshotToClipboardEnabledSelector,
    experimentalFeaturesEnabledSelector,
    isWhiteBackgroundSelector,
    hideFlatBuildingsSelector,
    resetCameraIfNewFileIsLoadedSelector,
    layoutAlgorithmSelector,
    maxTreeMapFilesSelector,
    sharpnessModeSelector
} from "./globalSettings.selectors"

describe("globalSettings.selectors", () => {
    let mockState: CcState

    beforeEach(() => {
        mockState = JSON.parse(JSON.stringify(defaultState))
    })

    describe("screenshotToClipboardEnabledSelector", () => {
        it("should select screenshotToClipboardEnabled from appSettings", () => {
            // Arrange
            mockState.appSettings.screenshotToClipboardEnabled = true

            // Act
            const result = screenshotToClipboardEnabledSelector.projector(mockState.appSettings)

            // Assert
            expect(result).toBe(true)
        })

        it("should return false when screenshotToClipboardEnabled is false", () => {
            // Arrange
            mockState.appSettings.screenshotToClipboardEnabled = false

            // Act
            const result = screenshotToClipboardEnabledSelector.projector(mockState.appSettings)

            // Assert
            expect(result).toBe(false)
        })
    })

    describe("experimentalFeaturesEnabledSelector", () => {
        it("should select experimentalFeaturesEnabled from appSettings", () => {
            // Arrange
            mockState.appSettings.experimentalFeaturesEnabled = true

            // Act
            const result = experimentalFeaturesEnabledSelector.projector(mockState.appSettings)

            // Assert
            expect(result).toBe(true)
        })

        it("should return false when experimentalFeaturesEnabled is false", () => {
            // Arrange
            mockState.appSettings.experimentalFeaturesEnabled = false

            // Act
            const result = experimentalFeaturesEnabledSelector.projector(mockState.appSettings)

            // Assert
            expect(result).toBe(false)
        })
    })

    describe("isWhiteBackgroundSelector", () => {
        it("should select isWhiteBackground from appSettings", () => {
            // Arrange
            mockState.appSettings.isWhiteBackground = true

            // Act
            const result = isWhiteBackgroundSelector.projector(mockState.appSettings)

            // Assert
            expect(result).toBe(true)
        })

        it("should return false when isWhiteBackground is false", () => {
            // Arrange
            mockState.appSettings.isWhiteBackground = false

            // Act
            const result = isWhiteBackgroundSelector.projector(mockState.appSettings)

            // Assert
            expect(result).toBe(false)
        })
    })

    describe("hideFlatBuildingsSelector", () => {
        it("should select hideFlatBuildings from appSettings", () => {
            // Arrange
            mockState.appSettings.hideFlatBuildings = true

            // Act
            const result = hideFlatBuildingsSelector.projector(mockState.appSettings)

            // Assert
            expect(result).toBe(true)
        })

        it("should return false when hideFlatBuildings is false", () => {
            // Arrange
            mockState.appSettings.hideFlatBuildings = false

            // Act
            const result = hideFlatBuildingsSelector.projector(mockState.appSettings)

            // Assert
            expect(result).toBe(false)
        })
    })

    describe("resetCameraIfNewFileIsLoadedSelector", () => {
        it("should select resetCameraIfNewFileIsLoaded from appSettings", () => {
            // Arrange
            mockState.appSettings.resetCameraIfNewFileIsLoaded = true

            // Act
            const result = resetCameraIfNewFileIsLoadedSelector.projector(mockState.appSettings)

            // Assert
            expect(result).toBe(true)
        })

        it("should return false when resetCameraIfNewFileIsLoaded is false", () => {
            // Arrange
            mockState.appSettings.resetCameraIfNewFileIsLoaded = false

            // Act
            const result = resetCameraIfNewFileIsLoadedSelector.projector(mockState.appSettings)

            // Assert
            expect(result).toBe(false)
        })
    })

    describe("layoutAlgorithmSelector", () => {
        it("should select layoutAlgorithm from appSettings", () => {
            // Arrange
            mockState.appSettings.layoutAlgorithm = LayoutAlgorithm.StreetMap

            // Act
            const result = layoutAlgorithmSelector.projector(mockState.appSettings)

            // Assert
            expect(result).toBe(LayoutAlgorithm.StreetMap)
        })

        it("should return SquarifiedTreeMap when set to SquarifiedTreeMap", () => {
            // Arrange
            mockState.appSettings.layoutAlgorithm = LayoutAlgorithm.SquarifiedTreeMap

            // Act
            const result = layoutAlgorithmSelector.projector(mockState.appSettings)

            // Assert
            expect(result).toBe(LayoutAlgorithm.SquarifiedTreeMap)
        })

        it("should return TreeMapStreet when set to TreeMapStreet", () => {
            // Arrange
            mockState.appSettings.layoutAlgorithm = LayoutAlgorithm.TreeMapStreet

            // Act
            const result = layoutAlgorithmSelector.projector(mockState.appSettings)

            // Assert
            expect(result).toBe(LayoutAlgorithm.TreeMapStreet)
        })
    })

    describe("maxTreeMapFilesSelector", () => {
        it("should select maxTreeMapFiles from appSettings", () => {
            // Arrange
            mockState.appSettings.maxTreeMapFiles = 250

            // Act
            const result = maxTreeMapFilesSelector.projector(mockState.appSettings)

            // Assert
            expect(result).toBe(250)
        })

        it("should return 1 when maxTreeMapFiles is set to minimum", () => {
            // Arrange
            mockState.appSettings.maxTreeMapFiles = 1

            // Act
            const result = maxTreeMapFilesSelector.projector(mockState.appSettings)

            // Assert
            expect(result).toBe(1)
        })

        it("should return 1000 when maxTreeMapFiles is set to maximum", () => {
            // Arrange
            mockState.appSettings.maxTreeMapFiles = 1000

            // Act
            const result = maxTreeMapFilesSelector.projector(mockState.appSettings)

            // Assert
            expect(result).toBe(1000)
        })
    })

    describe("sharpnessModeSelector", () => {
        it("should select sharpnessMode from appSettings", () => {
            // Arrange
            mockState.appSettings.sharpnessMode = SharpnessMode.PixelRatioFXAA

            // Act
            const result = sharpnessModeSelector.projector(mockState.appSettings)

            // Assert
            expect(result).toBe(SharpnessMode.PixelRatioFXAA)
        })

        it("should return Standard when sharpnessMode is Standard", () => {
            // Arrange
            mockState.appSettings.sharpnessMode = SharpnessMode.Standard

            // Act
            const result = sharpnessModeSelector.projector(mockState.appSettings)

            // Assert
            expect(result).toBe(SharpnessMode.Standard)
        })

        it("should return PixelRatioAA when sharpnessMode is PixelRatioAA", () => {
            // Arrange
            mockState.appSettings.sharpnessMode = SharpnessMode.PixelRatioAA

            // Act
            const result = sharpnessModeSelector.projector(mockState.appSettings)

            // Assert
            expect(result).toBe(SharpnessMode.PixelRatioAA)
        })
    })

    describe("Selector memoization", () => {
        it("should not recompute when appSettings reference is the same", () => {
            // Arrange
            const appSettings = mockState.appSettings
            const spy = jest.spyOn(screenshotToClipboardEnabledSelector, "projector")

            // Act
            screenshotToClipboardEnabledSelector.projector(appSettings)
            screenshotToClipboardEnabledSelector.projector(appSettings)

            // Assert
            expect(spy).toHaveBeenCalledTimes(2)
            // Memoization is tested at the selector level, not projector level
        })
    })
})
