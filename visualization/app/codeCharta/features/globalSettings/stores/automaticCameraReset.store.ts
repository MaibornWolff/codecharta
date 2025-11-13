import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { resetCameraIfNewFileIsLoadedSelector } from "../selectors/globalSettings.selectors"
import { setResetCameraIfNewFileIsLoaded } from "../../../state/store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"

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
