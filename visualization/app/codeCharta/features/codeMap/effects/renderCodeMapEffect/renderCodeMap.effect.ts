import { ErrorHandler, Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { asyncScheduler, combineLatest, filter, map, merge, share, switchMap, take, tap, throttleTime, withLatestFrom } from "rxjs"
import { CcState } from "../../../../model/codeCharta.model"
import { AccumulatedData, accumulatedDataSelector } from "../../../../renderer/renderModel/renderModel.facade"
import { ThreeRendererService, ThreeViewerService } from "../../../../renderer/threeViewer/threeViewer.facade"
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
        private readonly threeViewerService: ThreeViewerService,
        private readonly activeViewStore: ActiveViewStore,
        private readonly viewReadinessStore: ViewReadinessStore,
        private readonly errorHandler: ErrorHandler
    ) {}

    private readonly actionsRequiringRender$ = this.actions$.pipe(ofType(...actionsRequiringRerender))

    private readonly mapDataChange$ = combineLatest([this.store.select(accumulatedDataSelector), this.actionsRequiringRender$]).pipe(
        map(([accumulatedData]) => accumulatedData)
    )

    private readonly dataChangedWhileMetricsViewIsShown$ = this.mapDataChange$.pipe(
        withLatestFrom(this.activeViewStore.activeView$),
        filter(([, activeView]) => activeView === "metrics"),
        map(([accumulatedData]) => accumulatedData)
    )

    // A session that starts in another view shows the metrics view for the first time here, so the
    // catch-up render waits for that view to mount its canvas — building the map into a canvas that
    // is not there yet throws where the floor labels measure it.
    //
    // It reads the map data the store holds right now: pairing it with the action stream instead
    // would strand a view shown before any re-render action was dispatched with nothing to render.
    private readonly switchedToStaleMetricsView$ = this.activeViewStore.activeView$.pipe(
        filter(activeView => activeView === "metrics" && this.viewReadinessStore.isStale("metrics")),
        switchMap(() => this.threeViewerService.isMapCanvasMounted$.pipe(filter(Boolean), take(1))),
        withLatestFrom(this.store.select(accumulatedDataSelector)),
        map(([, accumulatedData]) => accumulatedData)
    )

    renderCodeMap$ = createEffect(
        () =>
            merge(this.dataChangedWhileMetricsViewIsShown$, this.switchedToStaleMetricsView$).pipe(
                filter((accumulatedData: AccumulatedData) => Boolean(accumulatedData.unifiedMapNode)),
                throttleTime(maxFPS, asyncScheduler, { leading: false, trailing: true }),
                tap(accumulatedData => this.renderMap(accumulatedData)),
                share()
            ),
        { dispatch: false }
    )

    // Every later render, and the readiness that clears the view's spinner, hang off this stream — so
    // a failing render is reported and left behind instead of ending it.
    private renderMap(accumulatedData: AccumulatedData): void {
        try {
            this.codeMapRenderService.load(accumulatedData.unifiedMapNode)
            this.threeRendererService.render()
        } catch (error) {
            this.errorHandler.handleError(error)
        } finally {
            clearPendingHeavyDispatch()
        }
    }
}
