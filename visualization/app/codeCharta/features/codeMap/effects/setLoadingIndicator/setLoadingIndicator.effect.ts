import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { debounceTime, filter, map, merge, skip, tap } from "rxjs"
import { CcState } from "../../../../model/codeCharta.model"
import { ViewReadinessStore } from "../../../../routing/viewReadiness.store"
import { filesLoaded, setIsLoadingFile, visibleFileStatesSelector } from "../../../../stores/fileStore/fileStore.facade"
import {
    addBlacklistItem,
    addBlacklistItems,
    removeBlacklistItem,
    removeBlacklistItems
} from "../../../../stores/sharedView/sharedView.write.facade"
import { RenderCodeMapEffect } from "../renderCodeMapEffect/renderCodeMap.effect"

/**
 * How long the map render has to stay quiet before the metrics view counts as rendered. A load ends in a
 * burst of late renders (blacklist apply, autoFit); clearing on the first of them makes the map visibly
 * jump right after the spinner disappears.
 */
export const RENDER_QUIET_PERIOD_MS = 350

/**
 * Owns two distinct things that used to be one overloaded boolean:
 *
 * - `isLoadingFile` — literally "a file load is in flight". Raised by LoadFilesUseCase before the fetch,
 *   lowered here when the load commits. Nothing about rendering is involved.
 * - per-view readiness — which views still have to rebuild their content. Each view shows its own
 *   spinner from its own flag, so the domain view never waits on the 3D map and vice versa.
 *
 * The old single flag could not express "domain is ready, metrics is not", so whichever view settled
 * first cleared the spinner for both — and on a route that never rendered a map, nothing cleared it at
 * all until a 60s deadline.
 */
@Injectable()
export class LoadingIndicatorEffect {
    constructor(
        private readonly store: Store<CcState>,
        private readonly actions$: Actions,
        private readonly renderCodeMapEffect: RenderCodeMapEffect,
        private readonly viewReadinessStore: ViewReadinessStore
    ) {}

    /** The load is over once its files are in the store. The views catch up on their own schedule. */
    hideLoadingFileOnCommit$ = createEffect(() =>
        this.actions$.pipe(
            ofType(filesLoaded),
            map(() => setIsLoadingFile({ value: false }))
        )
    )

    /**
     * Any change to the underlying data invalidates every view — a file-panel change (delta switch, file
     * removal, re-selection) as much as a load. A view the user is not looking at stays stale silently
     * until they switch to it; only then does its spinner appear.
     *
     * Deliberately NOT triggered by the START of a load: a load that fails (an invalid file, a bad URL)
     * never commits, and marking views stale up front would leave them waiting forever for a rebuild
     * that has no new data to rebuild from. While a load is in flight the spinner comes from
     * `isLoadingFile` instead, which the use-case lowers on both the success and the failure path.
     */
    markViewsStaleOnDataChange$ = createEffect(
        () =>
            merge(
                this.store.select(visibleFileStatesSelector).pipe(skip(1)),
                this.actions$.pipe(ofType(filesLoaded)),
                // Excluding or flattening changes what BOTH views show. The view the user did it in
                // catches up immediately; the other one rebuilds when they switch to it.
                this.actions$.pipe(ofType(addBlacklistItem, addBlacklistItems, removeBlacklistItem, removeBlacklistItems))
            ).pipe(
                tap(() => {
                    this.viewReadinessStore.markAllStale()
                })
            ),
        { dispatch: false }
    )

    /** The metrics view is ready once its map has rendered and the render burst has settled. */
    markMetricsReadyOnRender$ = createEffect(
        () =>
            this.renderCodeMapEffect.renderCodeMap$.pipe(
                debounceTime(RENDER_QUIET_PERIOD_MS),
                filter(() => this.viewReadinessStore.isStale("metrics")),
                tap(() => {
                    this.viewReadinessStore.markReady("metrics")
                })
            ),
        { dispatch: false }
    )
}
