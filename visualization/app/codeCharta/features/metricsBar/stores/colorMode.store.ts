import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, ColorMode } from "../../../codeCharta.model"
import { setColorMode } from "../../../mapState/store/colorMode/colorMode.actions"
import { colorModeSelector } from "../../../mapState/store/colorMode/colorMode.selector"

@Injectable({
    providedIn: "root"
})
export class ColorModeStore {
    constructor(private readonly store: Store<CcState>) {}

    colorMode$ = this.store.select(colorModeSelector)

    setColorMode(value: ColorMode) {
        this.store.dispatch(setColorMode({ value }))
    }
}
