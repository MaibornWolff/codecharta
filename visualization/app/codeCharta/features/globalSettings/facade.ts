import { Injectable } from "@angular/core"
import { ScreenshotDestinationService } from "./services/screenshotDestination.service"
import { ExperimentalFeaturesService } from "./services/experimentalFeatures.service"
import { BackgroundThemeService } from "./services/backgroundTheme.service"
import { FlatBuildingVisibilityService } from "./services/flatBuildingVisibility.service"
import { AutomaticCameraResetService } from "./services/automaticCameraReset.service"
import { MapLayoutService } from "./services/mapLayout.service"
import { DisplayQualityService } from "./services/displayQuality.service"

@Injectable({
    providedIn: "root"
})
export class GlobalSettingsFacade {
    constructor(
        private readonly screenshotDestinationService: ScreenshotDestinationService,
        private readonly experimentalFeaturesService: ExperimentalFeaturesService,
        private readonly backgroundThemeService: BackgroundThemeService,
        private readonly flatBuildingVisibilityService: FlatBuildingVisibilityService,
        private readonly automaticCameraResetService: AutomaticCameraResetService,
        private readonly mapLayoutService: MapLayoutService,
        private readonly displayQualityService: DisplayQualityService
    ) {}

    screenshotToClipboardEnabled$() {
        return this.screenshotDestinationService.screenshotToClipboardEnabled$()
    }

    experimentalFeaturesEnabled$() {
        return this.experimentalFeaturesService.experimentalFeaturesEnabled$()
    }

    isWhiteBackground$() {
        return this.backgroundThemeService.isWhiteBackground$()
    }

    hideFlatBuildings$() {
        return this.flatBuildingVisibilityService.hideFlatBuildings$()
    }

    resetCameraIfNewFileIsLoaded$() {
        return this.automaticCameraResetService.resetCameraIfNewFileIsLoaded$()
    }

    layoutAlgorithm$() {
        return this.mapLayoutService.layoutAlgorithm$()
    }

    maxTreeMapFiles$() {
        return this.mapLayoutService.maxTreeMapFiles$()
    }

    sharpnessMode$() {
        return this.displayQualityService.sharpnessMode$()
    }
}
