import { CcState } from "../../model/codeCharta.model"
import { defaultState } from "../rootStore/state.manager"
import {
    experimentalFeaturesEnabledSelector,
    maxTreeMapFilesSelector,
    resetCameraIfNewFileIsLoadedSelector,
    screenshotToClipboardEnabledSelector
} from "./preferences.read.facade"

describe("preferences.read.facade", () => {
    let mockState: CcState

    beforeEach(() => {
        mockState = JSON.parse(JSON.stringify(defaultState))
    })

    describe("screenshotToClipboardEnabledSelector", () => {
        it("should select screenshotToClipboardEnabled from preferences", () => {
            // Arrange
            mockState.preferences.screenshotToClipboardEnabled = true

            // Act
            const result = screenshotToClipboardEnabledSelector.projector(mockState.preferences)

            // Assert
            expect(result).toBe(true)
        })

        it("should return false when screenshotToClipboardEnabled is false", () => {
            // Arrange
            mockState.preferences.screenshotToClipboardEnabled = false

            // Act
            const result = screenshotToClipboardEnabledSelector.projector(mockState.preferences)

            // Assert
            expect(result).toBe(false)
        })
    })

    describe("experimentalFeaturesEnabledSelector", () => {
        it("should select experimentalFeaturesEnabled from preferences", () => {
            // Arrange
            mockState.preferences.experimentalFeaturesEnabled = true

            // Act
            const result = experimentalFeaturesEnabledSelector.projector(mockState.preferences)

            // Assert
            expect(result).toBe(true)
        })

        it("should return false when experimentalFeaturesEnabled is false", () => {
            // Arrange
            mockState.preferences.experimentalFeaturesEnabled = false

            // Act
            const result = experimentalFeaturesEnabledSelector.projector(mockState.preferences)

            // Assert
            expect(result).toBe(false)
        })
    })

    describe("resetCameraIfNewFileIsLoadedSelector", () => {
        it("should select resetCameraIfNewFileIsLoaded from preferences", () => {
            // Arrange
            mockState.preferences.resetCameraIfNewFileIsLoaded = true

            // Act
            const result = resetCameraIfNewFileIsLoadedSelector.projector(mockState.preferences)

            // Assert
            expect(result).toBe(true)
        })

        it("should return false when resetCameraIfNewFileIsLoaded is false", () => {
            // Arrange
            mockState.preferences.resetCameraIfNewFileIsLoaded = false

            // Act
            const result = resetCameraIfNewFileIsLoadedSelector.projector(mockState.preferences)

            // Assert
            expect(result).toBe(false)
        })
    })

    describe("maxTreeMapFilesSelector", () => {
        it("should select maxTreeMapFiles from preferences", () => {
            // Arrange
            mockState.preferences.maxTreeMapFiles = 250

            // Act
            const result = maxTreeMapFilesSelector.projector(mockState.preferences)

            // Assert
            expect(result).toBe(250)
        })

        it("should return 1 when maxTreeMapFiles is set to minimum", () => {
            // Arrange
            mockState.preferences.maxTreeMapFiles = 1

            // Act
            const result = maxTreeMapFilesSelector.projector(mockState.preferences)

            // Assert
            expect(result).toBe(1)
        })

        it("should return 1000 when maxTreeMapFiles is set to maximum", () => {
            // Arrange
            mockState.preferences.maxTreeMapFiles = 1000

            // Act
            const result = maxTreeMapFilesSelector.projector(mockState.preferences)

            // Assert
            expect(result).toBe(1000)
        })
    })
})
