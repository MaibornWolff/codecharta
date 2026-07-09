import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { setShowOutgoingEdges } from "../../../stores/mapState/mapState.write.facade"
import { showOutgoingEdgesSelector } from "../selectors/edgeAndColors.selectors"

@Injectable({
    providedIn: "root"
})
export class ShowOutgoingEdgesStore {
    constructor(private readonly store: Store<CcState>) {}

    showOutgoingEdges$ = this.store.select(showOutgoingEdgesSelector)

    setShowOutgoingEdges(value: boolean) {
        this.store.dispatch(setShowOutgoingEdges({ value }))
    }
}
