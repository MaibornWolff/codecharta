import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { asyncScheduler, combineLatest, filter, map, merge, share, tap, throttleTime, withLatestFrom } from "rxjs"
import { CcState } from "../../../../model/codeCharta.model"
import { AccumulatedData, accumulatedDataSelector } from "../../../../renderer/renderModel/renderModel.facade"
import { ThreeRendererService } from "../../../../renderer/threeViewer/threeViewer.facade"
import { ActiveViewStore } from "../../../../routing/activeView.store"
import { ViewReadinessStore } from "../../../../routing/viewReadiness.store"
import { clearPendingHeavyDispatch } from "../../../../util/dispatchAfterPaint"
import { CodeMapRenderService } from "../../codeMap.render.service"
import { actionsRequiringRerender } from "./actionsRequiringRerender"

export const maxFPS = 1000 / 60

@Injectable()
export class RenderCodeMapEffect {
    constructor(
        private readonly store: Store<CcState>,
        private readonly actions$: Actions,
        private readonly threeRendererService: ThreeRendererService,
        private readonly codeMapRenderService: CodeMapRenderService,
        private readonly activeViewStore: ActiveViewStore,
        private readonly viewReadinessStore: ViewReadinessStore
    ) {}

    private readonly actionsRequiringRender$ = this.actions$.pipe(ofType(...actionsRequiringRerender))

    private readonly mapDataChange$ = combineLatest([this.store.select(accumulatedDataSelector), this.actionsRequiringRender$]).pipe(
        map(([accumulatedData]) => accumulatedData)
    )

    // The staleness check gates the view-switch trigger only: the flag is raised after the store has
    // pushed the changed data through here, so gating a data change on it skips its render for good.
    renderCodeMap$ = createEffect(
        () =>
            merge(
                this.mapDataChange$.pipe(
                    withLatestFrom(this.activeViewStore.activeView$),
                    filter(([, activeView]) => activeView === "metrics"),
                    map(([accumulatedData]) => accumulatedData)
                ),
                this.activeViewStore.activeView$.pipe(
                    filter(activeView => activeView === "metrics" && this.viewReadinessStore.isStale("metrics")),
                    withLatestFrom(this.mapDataChange$),
                    map(([, accumulatedData]) => accumulatedData)
                )
            ).pipe(
                filter((accumulatedData: AccumulatedData) => Boolean(accumulatedData.unifiedMapNode)),
                throttleTime(maxFPS, asyncScheduler, { leading: false, trailing: true }),
                tap(accumulatedData => {
                    this.codeMapRenderService.load(accumulatedData.unifiedMapNode)
                    this.threeRendererService.render()
                    clearPendingHeavyDispatch()
                }),
                share()
            ),
        { dispatch: false }
    )
}
