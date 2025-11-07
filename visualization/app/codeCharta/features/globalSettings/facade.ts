/**
 * Public API for the GlobalSettings feature
 *
 * Architecture:
 * - Components can be imported directly from their respective paths
 * - Selectors are exported via this facade for use by other features
 * - Domain Services are exported via this facade for use by other features
 * - Store wrappers (stores/ folder) are internal and not exposed
 *
 * Flow: Components → Services → Stores (uses Selectors) → @ngrx/store
 *
 * Domain Services Pattern:
 * Each service represents a single domain concept with clear business meaning:
 * - DisplayQualityService: Controls render quality/sharpness
 * - MapLayoutService: Controls map layout algorithm and complexity
 * - BackgroundThemeService: Controls background appearance
 * - FlatBuildingVisibilityService: Controls visibility of flat buildings
 * - AutomaticCameraResetService: Controls automatic camera behavior
 * - ScreenshotDestinationService: Controls where screenshots go
 * - ExperimentalFeaturesService: Controls experimental feature access
 * - ResetSettingsService: Resets settings to defaults
 */

// Export selectors for use by other features
export {
    screenshotToClipboardEnabledSelector,
    experimentalFeaturesEnabledSelector,
    isWhiteBackgroundSelector,
    hideFlatBuildingsSelector,
    resetCameraIfNewFileIsLoadedSelector,
    layoutAlgorithmSelector,
    maxTreeMapFilesSelector,
    sharpnessModeSelector
} from "./selectors/globalSettings.selectors"

// Export domain services for use by other features
export { DisplayQualityService } from "./services/displayQuality.service"
export { MapLayoutService } from "./services/mapLayout.service"
export { BackgroundThemeService } from "./services/backgroundTheme.service"
export { FlatBuildingVisibilityService } from "./services/flatBuildingVisibility.service"
export { AutomaticCameraResetService } from "./services/automaticCameraReset.service"
export { ScreenshotDestinationService } from "./services/screenshotDestination.service"
export { ExperimentalFeaturesService } from "./services/experimentalFeatures.service"
export { ResetSettingsService } from "./services/resetSettings.service"

// Components are imported directly by other features, e.g.:
// import { GlobalConfigurationButtonComponent } from "features/globalSettings/components/globalConfigurationButton.component"
