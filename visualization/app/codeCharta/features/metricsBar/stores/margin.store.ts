import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { MapStateReadWindow } from "../../../mapState/mapState.read.facade"
import { setMargin } from "../../../mapState/mapState.write.facade"

@Injectable({
    providedIn: "root"
})
export class MarginStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly mapStateReadWindow: MapStateReadWindow
    ) {}

    margin$ = this.mapStateReadWindow.margin$

    setMargin(value: number) {
        this.store.dispatch(setMargin({ value }))
    }
}
