import { Injectable, inject } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { filter, switchMap, take, takeUntil, tap, timer } from "rxjs"
import { filesLoaded } from "../../../../stores/fileStore/fileStore.facade"
import { SharedViewReadWindow } from "../../../../stores/sharedView/sharedView.read.facade"
import { ExplorerRevealService } from "../../services/explorerReveal.service"

/**
 * How long after a load to keep waiting for a selection to appear. The selection is restored a few
 * dispatches after `filesLoaded`, so the value is generally not in the store yet when the load lands;
 * a load that simply has no selection must not leave the subscription open indefinitely.
 */
const AWAIT_RESTORED_SELECTION_MS = 2000

/**
 * Scrolls the selected node back into view after a file is loaded.
 *
 * Without this the tree re-renders around a selection the user cannot see — the row exists, is
 * highlighted, and sits somewhere off-screen. Reveal does NOT force the panel open here: the user may
 * have collapsed it deliberately, and a load is not a request to see the tree.
 */
@Injectable()
export class RevealSelectedNodeAfterLoadEffect {
    private readonly actions$ = inject(Actions)
    private readonly sharedViewReadWindow = inject(SharedViewReadWindow)
    private readonly revealService = inject(ExplorerRevealService)

    revealSelectedNodeAfterLoad$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(filesLoaded),
                switchMap(() =>
                    this.sharedViewReadWindow.selectedBuildingId$.pipe(
                        filter(Boolean),
                        take(1),
                        takeUntil(timer(AWAIT_RESTORED_SELECTION_MS))
                    )
                ),
                tap(selectedNodePath => this.revealService.revealNode(selectedNodePath, { expand: false }))
            ),
        { dispatch: false }
    )
}
