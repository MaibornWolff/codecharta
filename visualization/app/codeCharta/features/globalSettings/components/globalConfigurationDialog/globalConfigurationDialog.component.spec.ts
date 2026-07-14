import { HttpClient } from "@angular/common/http"
import { ComponentFixture, TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { LoadFileService } from "../../../../stores/fileStore/fileStore.facade"
import { defaultMapState } from "../../../../stores/mapState/mapState.read.facade"
import { defaultPreferences } from "../../../../stores/preferences/preferences.read.facade"
import { GlobalSettingsWriteStore } from "../../stores/globalSettings.write.store"
import { GlobalConfigurationDialogComponent } from "./globalConfigurationDialog.component"

describe("GlobalConfigurationDialogComponent", () => {
    let fixture: ComponentFixture<GlobalConfigurationDialogComponent>
    let component: GlobalConfigurationDialogComponent
    let mockGlobalSettingsWriteStore: jest.Mocked<Partial<GlobalSettingsWriteStore>>
    let mockState: jest.Mocked<Partial<State<any>>>

    beforeEach(() => {
        mockGlobalSettingsWriteStore = {
            setScreenshotToClipboard: jest.fn(),
            setExperimentalFeaturesEnabled: jest.fn(),
            setWhiteBackground: jest.fn(),
            setHideFlatBuildings: jest.fn(),
            setResetCameraIfNewFileIsLoaded: jest.fn(),
            setLayoutAlgorithm: jest.fn(),
            setMaxTreeMapFiles: jest.fn()
        }

        mockState = {
            getValue: jest.fn().mockReturnValue({ preferences: defaultPreferences, mapState: defaultMapState })
        }

        TestBed.configureTestingModule({
            imports: [GlobalConfigurationDialogComponent],
            providers: [
                provideMockStore({
                    initialState: { preferences: defaultPreferences, mapState: defaultMapState }
                }),
                { provide: State, useValue: mockState },
                { provide: GlobalSettingsWriteStore, useValue: mockGlobalSettingsWriteStore },
                { provide: LoadFileService, useValue: { loadFiles: jest.fn() } },
                { provide: HttpClient, useValue: {} }
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

        it("should render ResetSettingsButton component", () => {
            // Arrange & Act
            const resetButtonComponent = fixture.nativeElement.querySelector("cc-reset-settings-button")

            // Assert
            expect(resetButtonComponent).toBeTruthy()
        })

        it("should render ResetMapButton component", () => {
            // Arrange & Act
            const resetMapButtonComponent = fixture.nativeElement.querySelector("cc-reset-map-button")

            // Assert
            expect(resetMapButtonComponent).toBeTruthy()
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
            expect(mockGlobalSettingsWriteStore.setResetCameraIfNewFileIsLoaded).toHaveBeenCalledWith(true)
        })

        it("should call setResetCameraIfNewFileIsLoaded when handleResetCameraIfNewFileIsLoadedChanged is called with false", () => {
            // Arrange & Act
            component.handleResetCameraIfNewFileIsLoadedChanged(false)

            // Assert
            expect(mockGlobalSettingsWriteStore.setResetCameraIfNewFileIsLoaded).toHaveBeenCalledWith(false)
        })

        it("should call setHideFlatBuildings when handleHideFlatBuildingsChanged is called with true", () => {
            // Arrange & Act
            component.handleHideFlatBuildingsChanged(true)

            // Assert
            expect(mockGlobalSettingsWriteStore.setHideFlatBuildings).toHaveBeenCalledWith(true)
        })

        it("should call setHideFlatBuildings when handleHideFlatBuildingsChanged is called with false", () => {
            // Arrange & Act
            component.handleHideFlatBuildingsChanged(false)

            // Assert
            expect(mockGlobalSettingsWriteStore.setHideFlatBuildings).toHaveBeenCalledWith(false)
        })

        it("should call setWhiteBackground when handleIsWhiteBackgroundChanged is called with true", () => {
            // Arrange & Act
            component.handleIsWhiteBackgroundChanged(true)

            // Assert
            expect(mockGlobalSettingsWriteStore.setWhiteBackground).toHaveBeenCalledWith(true)
        })

        it("should call setWhiteBackground when handleIsWhiteBackgroundChanged is called with false", () => {
            // Arrange & Act
            component.handleIsWhiteBackgroundChanged(false)

            // Assert
            expect(mockGlobalSettingsWriteStore.setWhiteBackground).toHaveBeenCalledWith(false)
        })

        it("should call setExperimentalFeaturesEnabled when handleExperimentalFeaturesEnabledChanged is called with true", () => {
            // Arrange & Act
            component.handleExperimentalFeaturesEnabledChanged(true)

            // Assert
            expect(mockGlobalSettingsWriteStore.setExperimentalFeaturesEnabled).toHaveBeenCalledWith(true)
        })

        it("should call setExperimentalFeaturesEnabled when handleExperimentalFeaturesEnabledChanged is called with false", () => {
            // Arrange & Act
            component.handleExperimentalFeaturesEnabledChanged(false)

            // Assert
            expect(mockGlobalSettingsWriteStore.setExperimentalFeaturesEnabled).toHaveBeenCalledWith(false)
        })

        it("should call setScreenshotToClipboard when handleScreenshotToClipboardEnabledChanged is called with true", () => {
            // Arrange & Act
            component.handleScreenshotToClipboardEnabledChanged(true)

            // Assert
            expect(mockGlobalSettingsWriteStore.setScreenshotToClipboard).toHaveBeenCalledWith(true)
        })

        it("should call setScreenshotToClipboard when handleScreenshotToClipboardEnabledChanged is called with false", () => {
            // Arrange & Act
            component.handleScreenshotToClipboardEnabledChanged(false)

            // Assert
            expect(mockGlobalSettingsWriteStore.setScreenshotToClipboard).toHaveBeenCalledWith(false)
        })
    })
})
