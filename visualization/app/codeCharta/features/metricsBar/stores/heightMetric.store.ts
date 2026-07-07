import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { MapStateReadWindow } from "../../../stores/mapState/mapState.read.facade"
import { setHeightMetric } from "../../../stores/mapState/mapState.write.facade"

@Injectable({
    providedIn: "root"
})
export class HeightMetricStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly mapStateReadWindow: MapStateReadWindow
    ) {}

    heightMetric$ = this.mapStateReadWindow.heightMetric$

    setHeightMetric(value: string) {
        this.store.dispatch(setHeightMetric({ value }))
    }
}
