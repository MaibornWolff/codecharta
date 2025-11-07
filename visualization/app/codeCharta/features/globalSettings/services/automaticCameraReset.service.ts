import { Injectable } from "@angular/core"
import { AutomaticCameraResetStore } from "../stores/automaticCameraReset.store"

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
