import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { experimentalFeaturesEnabledSelector } from "../selectors/globalSettings.selectors"
import { setExperimentalFeaturesEnabled } from "../../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"

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
