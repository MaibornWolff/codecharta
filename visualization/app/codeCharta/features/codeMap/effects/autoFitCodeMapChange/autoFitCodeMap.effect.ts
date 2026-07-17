import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { combineLatest, filter, map, merge, skip, switchMap, take, tap, withLatestFrom } from "rxjs"
import { CcState } from "../../../../model/codeCharta.model"
import { ThreeMapControlsService, ThreeSceneService } from "../../../../renderer/threeViewer/threeViewer.facade"
import { filesLoaded, visibleFileStatesSelector } from "../../../../stores/fileStore/fileStore.facade"
import { GlobalSettingsFacade } from "../../../globalSettings/facade"
import { viewSelectorsTriggeringAutoFit } from "./selectorsTriggeringAutoFit"

/**
 * Step 6 of the post-load reconciliation: fit the camera to the map.
 *
 * It lives here rather than next to the rest of the sequence because it needs the renderer — but it
 * is driven by the same signals: a load (`filesLoaded`), a file-panel change, or one of the view
 * changes that alter the map's extent.
 */
@Injectable()
export class AutoFitCodeMapEffect {
    constructor(
        private readonly store: Store<CcState>,
        private readonly threeSceneService: ThreeSceneService,
        private readonly threeMapControlsService: ThreeMapControlsService,
        private readonly actions$: Actions,
        private readonly globalSettingsFacade: GlobalSettingsFacade
    ) {}

    private readonly autoFitRequests$ = merge(
        // `force` carries what the preference alone cannot express: the very first map is fitted once
        // even when the user turned the camera reset off.
        this.actions$.pipe(
            ofType(filesLoaded),
            map(action => ({ force: action.forceAutoFit }))
        ),
        this.store.select(visibleFileStatesSelector).pipe(
            skip(1),
            map(() => ({ force: false }))
        ),
        combineLatest(viewSelectorsTriggeringAutoFit.map(selector => this.store.select(selector))).pipe(
            skip(1),
            map(() => ({ force: false }))
        )
    )

    autoFitTo$ = createEffect(
        () =>
            this.autoFitRequests$.pipe(
                withLatestFrom(this.globalSettingsFacade.resetCameraIfNewFileIsLoaded$()),
                filter(([request, resetCameraIfNewFileIsLoaded]) => resetCameraIfNewFileIsLoaded || request.force),
                // Fit to the map this change produces, not the one still on screen: wait for the next
                // mesh swap into the scene. Requests come in a synchronous burst before that swap, so
                // switchMap subscribes ahead of it — unlike racing the throttled render stream, whose
                // trailing edge can fire first (reliably so after the CPU-heavy synchronous gzip inflate)
                // and be missed, leaving the camera unfit.
                switchMap(() => this.threeSceneService.mapMeshChanged$.pipe(take(1))),
                tap(() => {
                    this.threeMapControlsService.autoFitTo()
                })
            ),
        { dispatch: false }
    )
}
