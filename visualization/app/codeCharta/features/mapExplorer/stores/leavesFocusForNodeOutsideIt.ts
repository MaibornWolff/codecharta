import { Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { currentFocusedNodePathSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { unfocusNode } from "../../../stores/sharedView/sharedView.write.facade"
import { HandedOverMapNodeArrival } from "../handedOverMapNodeArrival"

/** The view and its explorer hold only what lies in the focus, so a node from outside it clears the focus. */
@Injectable()
export class LeavesFocusForNodeOutsideIt implements HandedOverMapNodeArrival {
    private readonly store: Store<CcState> = inject(Store)
    private readonly focusedNodePath = toSignal(this.store.select(currentFocusedNodePathSelector), { requireSync: true })

    receive(nodePath: string): void {
        const focusedNodePath = this.focusedNodePath()
        if (focusedNodePath && nodePath !== focusedNodePath && !nodePath.startsWith(`${focusedNodePath}/`)) {
            this.store.dispatch(unfocusNode())
        }
    }
}
