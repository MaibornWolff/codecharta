import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { setIsWhiteBackground } from "../../../stores/mapState/mapState.write.facade"
import { isWhiteBackgroundSelector } from "../selectors/globalSettings.selectors"

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
