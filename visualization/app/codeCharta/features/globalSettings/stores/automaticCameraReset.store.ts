import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { setResetCameraIfNewFileIsLoaded } from "../../../stores/preferences/preferences.write.facade"
import { resetCameraIfNewFileIsLoadedSelector } from "../selectors/globalSettings.selectors"

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
