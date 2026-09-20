import { ErrorHandler, Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { asyncScheduler, combineLatest, filter, map, merge, share, switchMap, take, tap, throttleTime, withLatestFrom } from "rxjs"
import { CcState, CodeMapNode } from "../../../../model/codeCharta.model"
import { AccumulatedData, accumulatedDataSelector } from "../../../../renderer/renderModel/renderModel.facade"
import { ThreeRendererService, ThreeViewerService } from "../../../../renderer/threeViewer/threeViewer.facade"
import { ActiveViewStore } from "../../../../routing/activeView.store"
import { ViewReadinessStore } from "../../../../routing/viewReadiness.store"
import { clearPendingHeavyDispatch } from "../../../../util/dispatchAfterPaint"
import { CodeMapRenderService } from "../../codeMap.render.service"
import { actionsRequiringRerender } from "./actionsRequiringRerender"
import { FULL_INVALIDATION, invalidationForAction, mergeInvalidations, RenderInvalidation } from "./renderInvalidation"

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

    // What the actions seen since the last render made stale. Several actions can land inside one
    // throttle window, so they are merged rather than overwritten, and the render consumes it.
    private pendingInvalidation: RenderInvalidation | null = null
    private lastRenderedMapNode: CodeMapNode | null = null

    private readonly actionsRequiringRender$ = this.actions$.pipe(
        ofType(...actionsRequiringRerender),
        tap(action => {
            const invalidation = invalidationForAction(action)
            this.pendingInvalidation = this.pendingInvalidation
                ? mergeInvalidations([this.pendingInvalidation, invalidation])
                : invalidation
        })
    )

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
            this.codeMapRenderService.load(accumulatedData.unifiedMapNode, this.consumeInvalidation(accumulatedData.unifiedMapNode))
            this.threeRendererService.render()
        } catch (error) {
            this.errorHandler.handleError(error)
        } finally {
            clearPendingHeavyDispatch()
        }
    }

    // A map node the last render did not draw invalidates every stage, whatever the actions said —
    // a freshly loaded file reaches the effect through the data, not through an action.
    private consumeInvalidation(mapNode: CodeMapNode): RenderInvalidation {
        const pending = mapNode === this.lastRenderedMapNode ? this.pendingInvalidation : null
        this.pendingInvalidation = null
        this.lastRenderedMapNode = mapNode
        return pending ?? FULL_INVALIDATION
    }
}
