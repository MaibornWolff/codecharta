import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { MapStateReadWindow } from "../../../mapState/mapState.read.facade"
import { setAreaMetric } from "../../../mapState/mapState.write.facade"

@Injectable({
    providedIn: "root"
})
export class AreaMetricStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly mapStateReadWindow: MapStateReadWindow
    ) {}

    areaMetric$ = this.mapStateReadWindow.areaMetric$

    setAreaMetric(value: string) {
        this.store.dispatch(setAreaMetric({ value }))
    }
}
