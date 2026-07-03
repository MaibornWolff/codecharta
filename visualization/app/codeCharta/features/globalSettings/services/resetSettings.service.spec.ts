import { TestBed } from "@angular/core/testing"
import { ResetSettingsService } from "./resetSettings.service"
import { ResetSettingsStore } from "../stores/resetSettings.store"

describe("ResetSettingsService", () => {
    let service: ResetSettingsService
    let mockStore: jest.Mocked<Partial<ResetSettingsStore>>

    beforeEach(() => {
        mockStore = {
            resetSettings: jest.fn()
        }

        TestBed.configureTestingModule({
            providers: [ResetSettingsService, { provide: ResetSettingsStore, useValue: mockStore }]
        })

        service = TestBed.inject(ResetSettingsService)
    })

    describe("resetSettings", () => {
        it("should delegate to store with single setting key", () => {
            // Arrange
            const settingsKeys = ["mapState.isWhiteBackground"]

            // Act
            service.resetSettings(settingsKeys)

            // Assert
            expect(mockStore.resetSettings).toHaveBeenCalledWith(settingsKeys)
        })

        it("should delegate to store with multiple setting keys", () => {
            // Arrange
            const settingsKeys = ["mapState.hideFlatBuildings", "preferences.experimentalFeaturesEnabled"]

            // Act
            service.resetSettings(settingsKeys)

            // Assert
            expect(mockStore.resetSettings).toHaveBeenCalledWith(settingsKeys)
        })

        it("should delegate to store with empty array", () => {
            // Arrange
            const settingsKeys: string[] = []

            // Act
            service.resetSettings(settingsKeys)

            // Assert
            expect(mockStore.resetSettings).toHaveBeenCalledWith(settingsKeys)
        })

        it("should delegate to store with layout algorithm key", () => {
            // Arrange
            const settingsKeys = ["mapState.layoutAlgorithm"]

            // Act
            service.resetSettings(settingsKeys)

            // Assert
            expect(mockStore.resetSettings).toHaveBeenCalledWith(settingsKeys)
        })

        it("should delegate to store with all globalSettings keys", () => {
            // Arrange
            const settingsKeys = [
                "preferences.screenshotToClipboardEnabled",
                "preferences.experimentalFeaturesEnabled",
                "mapState.isWhiteBackground",
                "mapState.hideFlatBuildings",
                "preferences.resetCameraIfNewFileIsLoaded",
                "mapState.layoutAlgorithm",
                "preferences.maxTreeMapFiles"
            ]

            // Act
            service.resetSettings(settingsKeys)

            // Assert
            expect(mockStore.resetSettings).toHaveBeenCalledWith(settingsKeys)
        })
    })
})
