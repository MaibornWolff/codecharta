import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { MapStateReadWindow } from "../../../mapState/mapState.read.facade"
import { setColorMetric } from "../../../mapState/mapState.write.facade"

@Injectable({
    providedIn: "root"
})
export class ColorMetricStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly mapStateReadWindow: MapStateReadWindow
    ) {}

    colorMetric$ = this.mapStateReadWindow.colorMetric$

    setColorMetric(value: string) {
        this.store.dispatch(setColorMetric({ value }))
    }
}
