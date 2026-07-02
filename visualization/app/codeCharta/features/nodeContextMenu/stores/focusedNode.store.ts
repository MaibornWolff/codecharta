import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { map } from "rxjs"
import { CcState } from "../../../codeCharta.model"
import {
    currentFocusedNodePathSelector,
    focusNode,
    unfocusAllNodes,
    unfocusNode,
    focusedNodePathSelector
} from "../../../sharedView/sharedView.facade"

@Injectable({
    providedIn: "root"
})
export class FocusedNodeStore {
    constructor(private readonly store: Store<CcState>) {}

    currentFocusedNodePath$ = this.store.select(currentFocusedNodePathSelector)
    hasPreviousFocusedNodePath$ = this.store.select(focusedNodePathSelector).pipe(map(focusedNodePaths => focusedNodePaths.length > 1))

    focus(path: string) {
        this.store.dispatch(focusNode({ value: path }))
    }

    unfocus() {
        this.store.dispatch(unfocusNode())
    }

    unfocusAll() {
        this.store.dispatch(unfocusAllNodes())
    }
}
