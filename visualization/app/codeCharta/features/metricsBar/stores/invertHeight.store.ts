import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { invertHeightSelector, setInvertHeight } from "../../../mapState/mapState.facade"

@Injectable({
    providedIn: "root"
})
export class InvertHeightStore {
    constructor(private readonly store: Store<CcState>) {}

    invertHeight$ = this.store.select(invertHeightSelector)

    setInvertHeight(value: boolean) {
        this.store.dispatch(setInvertHeight({ value }))
    }
}
