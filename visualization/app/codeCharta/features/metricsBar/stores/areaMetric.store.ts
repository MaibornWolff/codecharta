import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { MapStateReadWindow } from "../../../stores/mapState/mapState.read.facade"
import { setAreaMetric } from "../../../stores/mapState/mapState.write.facade"

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
