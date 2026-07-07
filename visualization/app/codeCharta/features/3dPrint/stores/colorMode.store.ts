import { Injectable } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { CcState, ColorMode } from "../../../model/codeCharta.model"
import { setColorMode } from "../../../stores/mapState/mapState.write.facade"
import { colorModeSelector } from "../selectors/3dPrint.selectors"

@Injectable({ providedIn: "root" })
export class Export3DColorModeStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    colorMode$ = this.store.select(colorModeSelector)

    getColorMode(): ColorMode {
        return this.state.getValue().mapState.colorMode
    }

    setAbsoluteColorMode() {
        this.store.dispatch(setColorMode({ value: ColorMode.absolute }))
    }
}
