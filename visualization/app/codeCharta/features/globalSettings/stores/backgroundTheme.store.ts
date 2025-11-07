import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { isWhiteBackgroundSelector } from "../selectors/globalSettings.selectors"
import { setIsWhiteBackground } from "../../../state/store/appSettings/isWhiteBackground/isWhiteBackground.actions"

@Injectable({
    providedIn: "root"
})
export class BackgroundThemeStore {
    constructor(private readonly store: Store<CcState>) {}

    isWhiteBackground$ = this.store.select(isWhiteBackgroundSelector)

    setWhiteBackground(value: boolean) {
        this.store.dispatch(setIsWhiteBackground({ value }))
    }
}
