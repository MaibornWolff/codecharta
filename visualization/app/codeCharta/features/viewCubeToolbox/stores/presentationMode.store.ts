import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { setPresentationMode } from "../../../preferences/preferences.facade"
import { isPresentationModeSelector } from "../../../preferences/preferences.facade"

@Injectable({ providedIn: "root" })
export class PresentationModeStore {
    constructor(private readonly store: Store<CcState>) {}

    presentationMode$ = this.store.select(isPresentationModeSelector)

    setPresentationMode(value: boolean) {
        this.store.dispatch(setPresentationMode({ value }))
    }
}
