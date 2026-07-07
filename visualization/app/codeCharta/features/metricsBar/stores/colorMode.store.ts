import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, ColorMode } from "../../../model/codeCharta.model"
import { MapStateReadWindow } from "../../../stores/mapState/mapState.read.facade"
import { setColorMode } from "../../../stores/mapState/mapState.write.facade"

@Injectable({
    providedIn: "root"
})
export class ColorModeStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly mapStateReadWindow: MapStateReadWindow
    ) {}

    colorMode$ = this.mapStateReadWindow.colorMode$

    setColorMode(value: ColorMode) {
        this.store.dispatch(setColorMode({ value }))
    }
}
