import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { showOutgoingEdgesSelector } from "../selectors/edgeAndColors.selectors"
import { setShowOutgoingEdges } from "../../../state/store/appSettings/showEdges/outgoing/showOutgoingEdges.actions"

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
