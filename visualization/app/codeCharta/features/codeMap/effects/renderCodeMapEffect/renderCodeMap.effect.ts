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

    /** A genuine change to what the map should show: new data, or a setting that alters the geometry. */
    private readonly mapDataChange$ = combineLatest([this.store.select(accumulatedDataSelector), this.actionsRequiringRender$]).pipe(
        map(([accumulatedData]) => accumulatedData)
    )

    /**
     * Building the map geometry is the most expensive thing the app does, and it is pointless while the
     * user is on another view — it would make a domain-view load wait on a map nobody can see. So the
     * render only ever runs while the metrics view is on screen, driven by two distinct triggers:
     *
     * - a genuine data/setting change (`mapDataChange$`) always rebuilds the visible map, and
     * - switching back to the metrics view rebuilds only a map that went stale while it was hidden.
     *
     * The staleness check belongs to the second trigger alone: it keeps a switch back to an already-current
     * map from rebuilding it for nothing. Gating the FIRST trigger on it was a bug — the flag is raised by a
     * sibling effect that runs *after* the store has already pushed the changed data through here, so an
     * exclude or a metric change on a settled map saw `isStale === false`, skipped its render, and then left
     * the spinner up forever because the render that would have cleared it never happened.
     */
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
