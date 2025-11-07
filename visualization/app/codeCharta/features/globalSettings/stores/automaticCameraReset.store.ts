import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { resetCameraIfNewFileIsLoadedSelector } from "../selectors/globalSettings.selectors"
import { setResetCameraIfNewFileIsLoaded } from "../../../state/store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"

/**
 * Store for automatic camera reset settings.
 * This is the ONLY place that injects Store for automatic camera reset.
 */
@Injectable({
    providedIn: "root"
})
export class AutomaticCameraResetStore {
    constructor(private readonly store: Store<CcState>) {}

    resetCameraIfNewFileIsLoaded$ = this.store.select(resetCameraIfNewFileIsLoadedSelector)

    setResetCameraIfNewFileIsLoaded(value: boolean) {
        this.store.dispatch(setResetCameraIfNewFileIsLoaded({ value }))
    }
}
