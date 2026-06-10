import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { showIncomingEdgesSelector } from "../selectors/edgeAndColors.selectors"
import { setShowIncomingEdges } from "../../../state/store/appSettings/showEdges/incoming/showIncomingEdges.actions"

@Injectable({
    providedIn: "root"
})
export class ShowIncomingEdgesStore {
    constructor(private readonly store: Store<CcState>) {}

    showIncomingEdges$ = this.store.select(showIncomingEdgesSelector)

    setShowIncomingEdges(value: boolean) {
        this.store.dispatch(setShowIncomingEdges({ value }))
    }
}
