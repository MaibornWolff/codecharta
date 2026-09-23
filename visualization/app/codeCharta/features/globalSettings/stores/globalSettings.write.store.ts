import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { setHideFlatBuildings, setIsWhiteBackground } from "../../../stores/mapState/mapState.write.facade"
import {
    setExperimentalFeaturesEnabled,
    setResetCameraIfNewFileIsLoaded,
    setScreenshotToClipboardEnabled
} from "../../../stores/preferences/preferences.write.facade"

@Injectable({
    providedIn: "root"
})
export class GlobalSettingsWriteStore {
    constructor(private readonly store: Store<CcState>) {}

    setResetCameraIfNewFileIsLoaded(value: boolean) {
        this.store.dispatch(setResetCameraIfNewFileIsLoaded({ value }))
    }

    setHideFlatBuildings(value: boolean) {
        this.store.dispatch(setHideFlatBuildings({ value }))
    }

    setWhiteBackground(value: boolean) {
        this.store.dispatch(setIsWhiteBackground({ value }))
    }

    setExperimentalFeaturesEnabled(value: boolean) {
        this.store.dispatch(setExperimentalFeaturesEnabled({ value }))
    }

    setScreenshotToClipboard(value: boolean) {
        this.store.dispatch(setScreenshotToClipboardEnabled({ value }))
    }
}
