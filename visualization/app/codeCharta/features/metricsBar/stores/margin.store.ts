import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { MapStateReadWindow } from "../../../stores/mapState/mapState.read.facade"
import { setMargin } from "../../../stores/mapState/mapState.write.facade"

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
