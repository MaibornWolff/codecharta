import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, Scaling } from "../../../codeCharta.model"
import { scalingSelector, setScaling } from "../../../mapState/mapState.facade"

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
