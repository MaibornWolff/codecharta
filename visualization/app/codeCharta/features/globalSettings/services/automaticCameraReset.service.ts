import { Injectable } from "@angular/core"
import { AutomaticCameraResetStore } from "../stores/automaticCameraReset.store"

/**
 * Service for automatic camera reset settings.
 * Controls whether the camera automatically resets when a new file is loaded.
 */
@Injectable({
    providedIn: "root"
})
export class AutomaticCameraResetService {
    constructor(private readonly automaticCameraResetStore: AutomaticCameraResetStore) {}

    resetCameraIfNewFileIsLoaded$() {
        return this.automaticCameraResetStore.resetCameraIfNewFileIsLoaded$
    }

    setResetCameraIfNewFileIsLoaded(value: boolean) {
        this.automaticCameraResetStore.setResetCameraIfNewFileIsLoaded(value)
    }
}
