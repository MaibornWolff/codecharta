import { ComponentFixture, TestBed } from "@angular/core/testing"
import { of } from "rxjs"
import { provideMockStore } from "@ngrx/store/testing"
import { State } from "@ngrx/store"
import { GlobalConfigurationDialogComponent } from "./globalConfigurationDialog.component"
import { ScreenshotDestinationService } from "../../services/screenshotDestination.service"
import { ExperimentalFeaturesService } from "../../services/experimentalFeatures.service"
import { BackgroundThemeService } from "../../services/backgroundTheme.service"
import { FlatBuildingVisibilityService } from "../../services/flatBuildingVisibility.service"
import { AutomaticCameraResetService } from "../../services/automaticCameraReset.service"
import { defaultAppSettings } from "../../../../state/store/appSettings/appSettings.reducer"

describe("GlobalConfigurationDialogComponent", () => {
    let fixture: ComponentFixture<GlobalConfigurationDialogComponent>
    let component: GlobalConfigurationDialogComponent
    let mockScreenshotDestinationService: jest.Mocked<Partial<ScreenshotDestinationService>>
    let mockExperimentalFeaturesService: jest.Mocked<Partial<ExperimentalFeaturesService>>
    let mockBackgroundThemeService: jest.Mocked<Partial<BackgroundThemeService>>
    let mockFlatBuildingVisibilityService: jest.Mocked<Partial<FlatBuildingVisibilityService>>
    let mockAutomaticCameraResetService: jest.Mocked<Partial<AutomaticCameraResetService>>
    let mockState: jest.Mocked<Partial<State<any>>>

    beforeEach(() => {
        mockScreenshotDestinationService = {
            screenshotToClipboardEnabled$: jest.fn().mockReturnValue(of(false)),
            setScreenshotToClipboard: jest.fn()
        }

        mockExperimentalFeaturesService = {
            experimentalFeaturesEnabled$: jest.fn().mockReturnValue(of(false)),
            setExperimentalFeaturesEnabled: jest.fn()
        }

        mockBackgroundThemeService = {
            isWhiteBackground$: jest.fn().mockReturnValue(of(false)),
            setWhiteBackground: jest.fn()
        }

        mockFlatBuildingVisibilityService = {
            hideFlatBuildings$: jest.fn().mockReturnValue(of(false)),
            setHideFlatBuildings: jest.fn()
        }

        mockAutomaticCameraResetService = {
            resetCameraIfNewFileIsLoaded$: jest.fn().mockReturnValue(of(true)),
            setResetCameraIfNewFileIsLoaded: jest.fn()
        }

        mockState = {
            getValue: jest.fn().mockReturnValue({ appSettings: defaultAppSettings })
        }

        TestBed.configureTestingModule({
            imports: [GlobalConfigurationDialogComponent],
            providers: [
                provideMockStore({
                    initialState: { appSettings: defaultAppSettings }
                }),
                { provide: State, useValue: mockState },
                { provide: ScreenshotDestinationService, useValue: mockScreenshotDestinationService },
                { provide: ExperimentalFeaturesService, useValue: mockExperimentalFeaturesService },
                { provide: BackgroundThemeService, useValue: mockBackgroundThemeService },
                { provide: FlatBuildingVisibilityService, useValue: mockFlatBuildingVisibilityService },
                { provide: AutomaticCameraResetService, useValue: mockAutomaticCameraResetService }
            ]
        })

        fixture = TestBed.createComponent(GlobalConfigurationDialogComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    describe("initialization", () => {
        it("should create component", () => {
            // Assert
            expect(component).toBeTruthy()
        })

        it("should inject all required services", () => {
            // Assert
            expect(mockScreenshotDestinationService.screenshotToClipboardEnabled$).toHaveBeenCalled()
            expect(mockExperimentalFeaturesService.experimentalFeaturesEnabled$).toHaveBeenCalled()
            expect(mockBackgroundThemeService.isWhiteBackground$).toHaveBeenCalled()
            expect(mockFlatBuildingVisibilityService.hideFlatBuildings$).toHaveBeenCalled()
            expect(mockAutomaticCameraResetService.resetCameraIfNewFileIsLoaded$).toHaveBeenCalled()
        })

        it("should initialize screenshotToClipboardEnabled signal", () => {
            // Arrange & Act
            const value = component.screenshotToClipboardEnabled()

            // Assert
            expect(value).toBe(false)
        })

        it("should initialize experimentalFeaturesEnabled signal", () => {
            // Arrange & Act
            const value = component.experimentalFeaturesEnabled()

            // Assert
            expect(value).toBe(false)
        })

        it("should initialize isWhiteBackground signal", () => {
            // Arrange & Act
            const value = component.isWhiteBackground()

            // Assert
            expect(value).toBe(false)
        })

        it("should initialize hideFlatBuildings signal", () => {
            // Arrange & Act
            const value = component.hideFlatBuildings()

            // Assert
            expect(value).toBe(false)
        })

        it("should initialize resetCameraIfNewFileIsLoaded signal", () => {
            // Arrange & Act
            const value = component.resetCameraIfNewFileIsLoaded()

            // Assert
            expect(value).toBe(true)
        })
    })

    describe("rendering sub-components", () => {
        it("should render MapLayoutSelection component", () => {
            // Arrange & Act
            const mapLayoutComponent = fixture.nativeElement.querySelector("cc-map-layout-selection")

            // Assert
            expect(mapLayoutComponent).toBeTruthy()
        })

        it("should render DisplayQualitySelection component", () => {
            // Arrange & Act
            const displayQualityComponent = fixture.nativeElement.querySelector("cc-display-quality-selection")

            // Assert
            expect(displayQualityComponent).toBeTruthy()
        })

        it("should render ResetSettingsButton component", () => {
            // Arrange & Act
            const resetButtonComponent = fixture.nativeElement.querySelector("cc-reset-settings-button")

            // Assert
            expect(resetButtonComponent).toBeTruthy()
        })

        it("should render SettingToggle components for all settings", () => {
            // Arrange & Act
            const toggleComponents = fixture.nativeElement.querySelectorAll("cc-setting-toggle")

            // Assert
            expect(toggleComponents.length).toBeGreaterThan(0)
        })

        it("should render ExternalLinks component", () => {
            // Arrange & Act
            const externalLinksComponent = fixture.nativeElement.querySelector("cc-external-links")

            // Assert
            expect(externalLinksComponent).toBeTruthy()
        })
    })

    describe("dialog methods", () => {
        it("should have dialog element", () => {
            // Arrange & Act
            const dialogElement = component.dialogElement()

            // Assert
            expect(dialogElement).toBeTruthy()
        })

        it("should open dialog when open() is called", () => {
            // Arrange
            const mockShowModal = jest.fn()
            component.dialogElement().nativeElement.showModal = mockShowModal

            // Act
            component.open()

            // Assert
            expect(mockShowModal).toHaveBeenCalled()
        })

        it("should close dialog when close() is called", () => {
            // Arrange
            const mockClose = jest.fn()
            component.dialogElement().nativeElement.close = mockClose

            // Act
            component.close()

            // Assert
            expect(mockClose).toHaveBeenCalled()
        })
    })

    describe("setting change handlers", () => {
        it("should call setResetCameraIfNewFileIsLoaded when handleResetCameraIfNewFileIsLoadedChanged is called with true", () => {
            // Arrange & Act
            component.handleResetCameraIfNewFileIsLoadedChanged(true)

            // Assert
            expect(mockAutomaticCameraResetService.setResetCameraIfNewFileIsLoaded).toHaveBeenCalledWith(true)
        })

        it("should call setResetCameraIfNewFileIsLoaded when handleResetCameraIfNewFileIsLoadedChanged is called with false", () => {
            // Arrange & Act
            component.handleResetCameraIfNewFileIsLoadedChanged(false)

            // Assert
            expect(mockAutomaticCameraResetService.setResetCameraIfNewFileIsLoaded).toHaveBeenCalledWith(false)
        })

        it("should call setHideFlatBuildings when handleHideFlatBuildingsChanged is called with true", () => {
            // Arrange & Act
            component.handleHideFlatBuildingsChanged(true)

            // Assert
            expect(mockFlatBuildingVisibilityService.setHideFlatBuildings).toHaveBeenCalledWith(true)
        })

        it("should call setHideFlatBuildings when handleHideFlatBuildingsChanged is called with false", () => {
            // Arrange & Act
            component.handleHideFlatBuildingsChanged(false)

            // Assert
            expect(mockFlatBuildingVisibilityService.setHideFlatBuildings).toHaveBeenCalledWith(false)
        })

        it("should call setWhiteBackground when handleIsWhiteBackgroundChanged is called with true", () => {
            // Arrange & Act
            component.handleIsWhiteBackgroundChanged(true)

            // Assert
            expect(mockBackgroundThemeService.setWhiteBackground).toHaveBeenCalledWith(true)
        })

        it("should call setWhiteBackground when handleIsWhiteBackgroundChanged is called with false", () => {
            // Arrange & Act
            component.handleIsWhiteBackgroundChanged(false)

            // Assert
            expect(mockBackgroundThemeService.setWhiteBackground).toHaveBeenCalledWith(false)
        })

        it("should call setExperimentalFeaturesEnabled when handleExperimentalFeaturesEnabledChanged is called with true", () => {
            // Arrange & Act
            component.handleExperimentalFeaturesEnabledChanged(true)

            // Assert
            expect(mockExperimentalFeaturesService.setExperimentalFeaturesEnabled).toHaveBeenCalledWith(true)
        })

        it("should call setExperimentalFeaturesEnabled when handleExperimentalFeaturesEnabledChanged is called with false", () => {
            // Arrange & Act
            component.handleExperimentalFeaturesEnabledChanged(false)

            // Assert
            expect(mockExperimentalFeaturesService.setExperimentalFeaturesEnabled).toHaveBeenCalledWith(false)
        })

        it("should call setScreenshotToClipboard when handleScreenshotToClipboardEnabledChanged is called with true", () => {
            // Arrange & Act
            component.handleScreenshotToClipboardEnabledChanged(true)

            // Assert
            expect(mockScreenshotDestinationService.setScreenshotToClipboard).toHaveBeenCalledWith(true)
        })

        it("should call setScreenshotToClipboard when handleScreenshotToClipboardEnabledChanged is called with false", () => {
            // Arrange & Act
            component.handleScreenshotToClipboardEnabledChanged(false)

            // Assert
            expect(mockScreenshotDestinationService.setScreenshotToClipboard).toHaveBeenCalledWith(false)
        })
    })
})
