import { Injectable } from "@angular/core"
import { ExperimentalFeaturesStore } from "../stores/experimentalFeatures.store"

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
