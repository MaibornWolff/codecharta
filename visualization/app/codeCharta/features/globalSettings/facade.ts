import { Injectable } from "@angular/core"
import { MapStateReadWindow } from "../../stores/mapState/mapState.read.facade"
import { PreferencesReadWindow } from "../../stores/preferences/preferences.read.facade"

@Injectable({
    providedIn: "root"
})
export class GlobalSettingsFacade {
    constructor(
        private readonly preferencesReadWindow: PreferencesReadWindow,
        private readonly mapStateReadWindow: MapStateReadWindow
    ) {}

    screenshotToClipboardEnabled$() {
        return this.preferencesReadWindow.screenshotToClipboardEnabled$
    }

    experimentalFeaturesEnabled$() {
        return this.preferencesReadWindow.experimentalFeaturesEnabled$
    }

    isWhiteBackground$() {
        return this.mapStateReadWindow.isWhiteBackground$
    }

    hideFlatBuildings$() {
        return this.mapStateReadWindow.hideFlatBuildings$
    }

    resetCameraIfNewFileIsLoaded$() {
        return this.preferencesReadWindow.resetCameraIfNewFileIsLoaded$
    }

    layoutAlgorithm$() {
        return this.mapStateReadWindow.layoutAlgorithm$
    }

    maxTreeMapFiles$() {
        return this.preferencesReadWindow.maxTreeMapFiles$
    }
}
