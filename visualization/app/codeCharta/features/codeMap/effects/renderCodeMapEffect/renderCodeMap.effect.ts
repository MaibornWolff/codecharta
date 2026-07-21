import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { asyncScheduler, combineLatest, filter, share, tap, throttleTime } from "rxjs"
import { CcState } from "../../../../model/codeCharta.model"
import { accumulatedDataSelector } from "../../../../renderer/renderModel/renderModel.facade"
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

    /**
     * Building the map geometry is the most expensive thing the app does, and it is pointless while the
     * user is on another view — it would make a domain-view load wait on a map nobody can see. So the
     * active view is part of the trigger: while metrics is off screen nothing renders, and the moment the
     * user switches to it the combineLatest re-emits with the newest data and the map catches up. The
     * staleness check keeps a switch back to an already-current map from rebuilding it for nothing.
     */
    renderCodeMap$ = createEffect(
        () =>
            combineLatest([
                this.store.select(accumulatedDataSelector),
                this.actionsRequiringRender$,
                this.activeViewStore.activeView$
            ]).pipe(
                filter(
                    ([accumulatedData, , activeView]) =>
                        Boolean(accumulatedData.unifiedMapNode) && activeView === "metrics" && this.viewReadinessStore.isStale("metrics")
                ),
                throttleTime(maxFPS, asyncScheduler, { leading: false, trailing: true }),
                tap(([accumulatedData]) => {
                    this.codeMapRenderService.load(accumulatedData.unifiedMapNode)
                    this.threeRendererService.render()
                    clearPendingHeavyDispatch()
                }),
                share()
            ),
        { dispatch: false }
    )
}
