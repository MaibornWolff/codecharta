import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { setEdgeHeight } from "../../../stores/mapState/mapState.write.facade"
import { edgeHeightSelector } from "../selectors/edgeAndColors.selectors"

@Injectable({
    providedIn: "root"
})
export class EdgeHeightStore {
    constructor(private readonly store: Store<CcState>) {}

    edgeHeight$ = this.store.select(edgeHeightSelector)

    setEdgeHeight(value: number) {
        this.store.dispatch(setEdgeHeight({ value }))
    }
}
