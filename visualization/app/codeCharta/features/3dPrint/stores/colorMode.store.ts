import { Injectable } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { CcState, ColorMode } from "../../../codeCharta.model"
import { setColorMode } from "../../../state/store/dynamicSettings/colorMode/colorMode.actions"
import { colorModeSelector } from "../selectors/3dPrint.selectors"

@Injectable({ providedIn: "root" })
export class ColorModeStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    colorMode$ = this.store.select(colorModeSelector)

    getColorMode(): ColorMode {
        return this.state.getValue().dynamicSettings.colorMode
    }

    setAbsoluteColorMode() {
        this.store.dispatch(setColorMode({ value: ColorMode.absolute }))
    }
}
