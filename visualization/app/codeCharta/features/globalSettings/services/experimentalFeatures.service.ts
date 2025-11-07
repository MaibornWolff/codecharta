import { Injectable } from "@angular/core"
import { ExperimentalFeaturesStore } from "../stores/experimentalFeatures.store"

/**
 * Service for experimental features settings.
 * Controls access to experimental and preview features.
 */
@Injectable({
    providedIn: "root"
})
export class ExperimentalFeaturesService {
    constructor(private readonly experimentalFeaturesStore: ExperimentalFeaturesStore) {}

    experimentalFeaturesEnabled$() {
        return this.experimentalFeaturesStore.experimentalFeaturesEnabled$
    }

    setExperimentalFeaturesEnabled(value: boolean) {
        this.experimentalFeaturesStore.setExperimentalFeaturesEnabled(value)
    }
}
