import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { edgeHeightSelector } from "../selectors/edgeAndColors.selectors"
import { setEdgeHeight } from "../../../appearance/appearance.facade"

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
