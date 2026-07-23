import { Injectable, inject } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { filter, switchMap, take, takeUntil, tap, timer } from "rxjs"
import { filesLoaded } from "../../../../stores/fileStore/fileStore.facade"
import { SharedViewReadWindow } from "../../../../stores/sharedView/sharedView.read.facade"
import { ExplorerRevealService } from "../../services/explorerReveal.service"

const AWAIT_RESTORED_SELECTION_MS = 2000

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
