import { Directive, inject } from "@angular/core"
import { takeUntilDestroyed } from "@angular/core/rxjs-interop"
import { Actions, ofType } from "@ngrx/effects"
import { filter, switchMap, take, takeUntil, timer } from "rxjs"
import { ExplorerRevealService } from "../../../features/sidebarExplorer/facade"
import { filesLoaded } from "../../../stores/fileStore/fileStore.facade"
import { SharedViewReadWindow } from "../../../stores/sharedView/sharedView.read.facade"

const AWAIT_RESTORED_SELECTION_MS = 2000

@Directive({
    selector: "[ccRevealsSelectedNodeAfterLoad]"
})
export class RevealsSelectedNodeAfterLoadDirective {
    private readonly actions$ = inject(Actions)
    private readonly sharedViewReadWindow = inject(SharedViewReadWindow)
    private readonly revealService = inject(ExplorerRevealService)

    constructor() {
        this.actions$
            .pipe(
                ofType(filesLoaded),
                switchMap(() =>
                    this.sharedViewReadWindow.selectedBuildingId$.pipe(
                        filter(Boolean),
                        take(1),
                        takeUntil(timer(AWAIT_RESTORED_SELECTION_MS))
                    )
                ),
                takeUntilDestroyed()
            )
            .subscribe(selectedNodePath => this.revealService.revealNode(selectedNodePath, { expand: false }))
    }
}
