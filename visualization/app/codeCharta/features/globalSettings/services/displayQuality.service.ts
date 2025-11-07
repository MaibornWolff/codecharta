import { Injectable } from "@angular/core"
import { SharpnessMode } from "../../../codeCharta.model"
import { DisplayQualityStore } from "../stores/displayQuality.store"

/**
 * Service for display quality settings (render quality/sharpness).
 * Controls how sharp and clear the visualization appears.
 */
@Injectable({
    providedIn: "root"
})
export class DisplayQualityService {
    constructor(private readonly displayQualityStore: DisplayQualityStore) {}

    sharpnessMode$() {
        return this.displayQualityStore.sharpnessMode$
    }

    setSharpnessMode(value: SharpnessMode) {
        this.displayQualityStore.setSharpnessMode(value)
    }
}
