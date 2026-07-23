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

export const RENDER_QUIET_PERIOD_MS = 350

@Injectable()
export class LoadingIndicatorEffect {
    constructor(
        private readonly store: Store<CcState>,
        private readonly actions$: Actions,
        private readonly renderCodeMapEffect: RenderCodeMapEffect,
        private readonly viewReadinessStore: ViewReadinessStore
    ) {}

    hideLoadingFileOnCommit$ = createEffect(() =>
        this.actions$.pipe(
            ofType(filesLoaded),
            map(() => setIsLoadingFile({ value: false }))
        )
    )

    markViewsStaleOnDataChange$ = createEffect(
        () =>
            merge(
                this.store.select(visibleFileStatesSelector).pipe(skip(1)),
                this.actions$.pipe(ofType(filesLoaded)),
                this.actions$.pipe(ofType(addBlacklistItem, addBlacklistItems, removeBlacklistItem, removeBlacklistItems))
            ).pipe(
                tap(() => {
                    this.viewReadinessStore.markAllStale()
                })
            ),
        { dispatch: false }
    )

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
