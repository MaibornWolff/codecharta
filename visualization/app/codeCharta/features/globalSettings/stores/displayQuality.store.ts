import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, SharpnessMode } from "../../../codeCharta.model"
import { sharpnessModeSelector } from "../selectors/globalSettings.selectors"
import { setSharpnessMode } from "../../../state/store/appSettings/sharpnessMode/sharpnessMode.actions"

/**
 * Store for display quality settings.
 * This is the ONLY place that injects Store for display quality.
 */
@Injectable({
    providedIn: "root"
})
export class DisplayQualityStore {
    constructor(private readonly store: Store<CcState>) {}

    sharpnessMode$ = this.store.select(sharpnessModeSelector)

    setSharpnessMode(value: SharpnessMode) {
        this.store.dispatch(setSharpnessMode({ value }))
    }
}
