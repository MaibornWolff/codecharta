import { Injectable } from "@angular/core"
import { Router } from "@angular/router"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { debounceTime, filter, map, NEVER, Observable, race, skip, switchMap, take, tap, timer } from "rxjs"
import { CcState } from "../../../../model/codeCharta.model"
import { routeLinks } from "../../../../routing/routePaths"
import {
    FileStoreReadWindow,
    filesLoaded,
    setIsLoadingFile,
    visibleFileStatesSelector
} from "../../../../stores/fileStore/fileStore.facade"
import { RenderCodeMapEffect } from "../renderCodeMapEffect/renderCodeMap.effect"

export const LOADING_INDICATOR_QUIET_PERIOD_MS = 350

/**
 * The last-resort deadline for a load that never renders. It is deliberately far longer than any real
 * load: the indicator is armed the moment a load STARTS (before the file is even fetched), so a deadline
 * anywhere near a plausible load time would dismiss the spinner mid-load — which does not merely look
 * wrong, it tells the rest of the app the load is done while it is still writing to the store.
 */
export const LOADING_INDICATOR_MAX_WAIT_MS = 60_000

/**
 * Step 7 of the post-load reconciliation: the loading indicator goes down when the map it was raised
 * for is on screen.
 *
 * Together with LoadFilesUseCase — which raises it at the start of every load, before the fetch —
 * this is the only place that writes isLoadingFile. It used to have five writers, one of them an
 * imperative boolean living outside the store.
 */
@Injectable()
export class LoadingIndicatorEffect {
    constructor(
        private readonly store: Store<CcState>,
        private readonly actions$: Actions,
        private readonly fileStoreReadWindow: FileStoreReadWindow,
        private readonly renderCodeMapEffect: RenderCodeMapEffect,
        private readonly router: Router
    ) {}

    /**
     * Which raise armed the current wait. The two raisers need opposite settle conditions on a non-map
     * route, and they dispatch the same action, so the distinction has to be carried here: a file-panel
     * change has ALREADY landed when it raises the indicator, while a load raises it before the files
     * have even been fetched. Cleared whenever the wait resolves.
     */
    private armedByFileSelectionChange = false

    /** A file-panel change (delta switch, file removal, re-selection) rebuilds the map too. */
    showOnFileSelectionChange$ = createEffect(() =>
        this.store.select(visibleFileStatesSelector).pipe(
            skip(1),
            tap(() => {
                this.armedByFileSelectionChange = true
            }),
            map(() => setIsLoadingFile({ value: true }))
        )
    )

    hideAfterRender$ = createEffect(() =>
        this.fileStoreReadWindow.isLoadingFile$.pipe(
            filter(Boolean),
            switchMap(() =>
                race(
                    // Wait for the burst of late-arriving renders (blacklist apply, autoFit) to settle,
                    // otherwise the user sees the map jump right after the spinner clears.
                    this.renderCodeMapEffect.renderCodeMap$.pipe(debounceTime(LOADING_INDICATOR_QUIET_PERIOD_MS), take(1)),
                    this.nonMapViewSettled$(),
                    // A load that produces no renderable content at all must not leave the spinner up forever.
                    timer(LOADING_INDICATOR_MAX_WAIT_MS)
                )
            ),
            tap(() => {
                this.armedByFileSelectionChange = false
            }),
            map(() => setIsLoadingFile({ value: false }))
        )
    )

    /**
     * A non-map view (the domain word cloud) produces no renderCodeMap$, so waiting on the map render
     * alone would leave the spinner up until the max-wait deadline. Clear once the file data has settled
     * instead — the same quiet period gives the view time to render its own content.
     */
    private nonMapViewSettled$(): Observable<unknown> {
        if (this.isOnMetricsRoute()) {
            return NEVER
        }
        if (this.armedByFileSelectionChange) {
            // The change is already in the store, so the CURRENT file set is the one to settle on.
            // Waiting for a SUBSEQUENT emission would hang: the emission that raised the indicator is
            // usually the last one there is.
            return this.fileStatesSettled$()
        }
        // A load raised the indicator before the fetch, so the file set still holds the PREVIOUS files.
        // Settling on it now would drop the spinner mid-load; wait for the commit first.
        return this.actions$.pipe(
            ofType(filesLoaded),
            take(1),
            switchMap(() => this.fileStatesSettled$())
        )
    }

    private fileStatesSettled$(): Observable<unknown> {
        return this.store.select(visibleFileStatesSelector).pipe(debounceTime(LOADING_INDICATOR_QUIET_PERIOD_MS), take(1))
    }

    /** The metrics (3D map) view is the only view that produces a renderable map. */
    private isOnMetricsRoute(): boolean {
        return this.router.url.split("?")[0] === routeLinks.metrics
    }
}
