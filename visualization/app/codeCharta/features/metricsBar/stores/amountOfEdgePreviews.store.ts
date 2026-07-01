import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { amountOfEdgePreviewsSelector } from "../selectors/edgeAndColors.selectors"
import { setAmountOfEdgePreviews } from "../../../appearance/appearance.facade"

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
