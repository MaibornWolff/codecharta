import { computed, Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { currentFocusedNodePathSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { unfocusNode } from "../../../stores/sharedView/sharedView.write.facade"

/** The focus every view shares, for the controls that show it and leave it. */
@Injectable({ providedIn: "root" })
export class SharedFocusStore {
    private readonly store: Store<CcState> = inject(Store)

    readonly focusedNodePath = toSignal(this.store.select(currentFocusedNodePathSelector), { requireSync: true })
    readonly isFocused = computed(() => Boolean(this.focusedNodePath()))

    unfocus(): void {
        this.store.dispatch(unfocusNode())
    }
}
