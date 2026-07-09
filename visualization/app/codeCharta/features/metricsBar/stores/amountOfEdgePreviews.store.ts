import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { setAmountOfEdgePreviews } from "../../../stores/mapState/mapState.write.facade"
import { amountOfEdgePreviewsSelector } from "../selectors/edgeAndColors.selectors"

@Injectable({
    providedIn: "root"
})
export class AmountOfEdgePreviewsStore {
    constructor(private readonly store: Store<CcState>) {}

    amountOfEdgePreviews$ = this.store.select(amountOfEdgePreviewsSelector)

    setAmountOfEdgePreviews(value: number) {
        this.store.dispatch(setAmountOfEdgePreviews({ value }))
    }
}
