import { Injectable, inject } from "@angular/core"
import { createEffect } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { tap } from "rxjs"
import { CcState } from "../../../../model/codeCharta.model"
import { currentFocusedNodePathSelector } from "../../../../stores/sharedView/sharedView.read.facade"
import { isInsideFolder } from "../../isInsideFolder"
import { DomainSelectionStore } from "../../stores/domainSelection.store"

/** The cloud shows the selected node before it shows the focus, so a selection left standing outside
 * a new focus would make focusing look like it did nothing. */
@Injectable()
export class LetGoOfSelectionOutsideFocusEffect {
    private readonly store: Store<CcState> = inject(Store)
    private readonly domainSelectionStore = inject(DomainSelectionStore)

    letGoOfSelectionOutsideFocus$ = createEffect(
        () =>
            this.store.select(currentFocusedNodePathSelector).pipe(
                tap(focusedNodePath => {
                    const selectedNodePath = this.domainSelectionStore.selectedNodePath()
                    if (focusedNodePath && selectedNodePath && !isInsideFolder(selectedNodePath, focusedNodePath)) {
                        this.domainSelectionStore.clear()
                    }
                })
            ),
        { dispatch: false }
    )
}
