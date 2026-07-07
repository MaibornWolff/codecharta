import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, Scaling } from "../../../model/codeCharta.model"
import { scalingSelector } from "../../../stores/mapState/mapState.read.facade"
import { setScaling } from "../../../stores/mapState/mapState.write.facade"

@Injectable({
    providedIn: "root"
})
export class ScalingStore {
    constructor(private readonly store: Store<CcState>) {}

    scaling$ = this.store.select(scalingSelector)

    setScaling(value: Partial<Scaling>) {
        this.store.dispatch(setScaling({ value }))
    }
}
