import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, ColorMode } from "../../../model/codeCharta.model"
import { colorModeSelector, MapStateReadWindow } from "../../../stores/mapState/mapState.read.facade"
import { setColorMode } from "../../../stores/mapState/mapState.write.facade"

@Injectable({ providedIn: "root" })
export class Export3DColorModeStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly mapStateReadWindow: MapStateReadWindow
    ) {}

    colorMode$ = this.store.select(colorModeSelector)

    getColorMode(): ColorMode {
        return this.mapStateReadWindow.getColorMode()
    }

    setAbsoluteColorMode() {
        this.store.dispatch(setColorMode({ value: ColorMode.absolute }))
    }
}
