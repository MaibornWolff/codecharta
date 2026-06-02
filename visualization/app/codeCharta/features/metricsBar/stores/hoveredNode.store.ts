import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { hoveredNodeSelector } from "../../../state/selectors/hoveredNode.selector"

@Injectable({
    providedIn: "root"
})
export class HoveredNodeStore {
    constructor(private readonly store: Store<CcState>) {}

    hoveredNode$ = this.store.select(hoveredNodeSelector)
}
