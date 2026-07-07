import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { setPresentationMode } from "../../../stores/preferences/preferences.write.facade"
import { isPresentationModeSelector } from "../../../stores/preferences/preferences.read.facade"

@Injectable({ providedIn: "root" })
export class PresentationModeStore {
    constructor(private readonly store: Store<CcState>) {}

    presentationMode$ = this.store.select(isPresentationModeSelector)

    setPresentationMode(value: boolean) {
        this.store.dispatch(setPresentationMode({ value }))
    }
}
