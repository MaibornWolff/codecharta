import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { experimentalFeaturesEnabledSelector } from "../../../stores/preferences/preferences.read.facade"
import { setExperimentalFeaturesEnabled } from "../../../stores/preferences/preferences.write.facade"

@Injectable({
    providedIn: "root"
})
export class ExperimentalFeaturesStore {
    constructor(private readonly store: Store<CcState>) {}

    experimentalFeaturesEnabled$ = this.store.select(experimentalFeaturesEnabledSelector)

    setExperimentalFeaturesEnabled(value: boolean) {
        this.store.dispatch(setExperimentalFeaturesEnabled({ value }))
    }
}
