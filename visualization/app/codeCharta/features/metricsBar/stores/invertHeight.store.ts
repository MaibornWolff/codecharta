import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { invertHeightSelector } from "../../../stores/mapState/mapState.read.facade"
import { setInvertHeight } from "../../../stores/mapState/mapState.write.facade"

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
