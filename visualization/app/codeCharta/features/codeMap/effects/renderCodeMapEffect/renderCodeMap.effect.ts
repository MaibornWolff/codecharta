import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { asyncScheduler, combineLatest, filter, share, tap, throttleTime } from "rxjs"
import { CcState } from "../../../../model/codeCharta.model"
import { accumulatedDataSelector } from "../../../../renderer/renderModel/renderModel.facade"
import { ThreeRendererService } from "../../../../renderer/threeViewer/threeViewer.facade"
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
        private readonly codeMapRenderService: CodeMapRenderService
    ) {}

    private readonly actionsRequiringRender$ = this.actions$.pipe(ofType(...actionsRequiringRerender))

    renderCodeMap$ = createEffect(
        () =>
            combineLatest([this.store.select(accumulatedDataSelector), this.actionsRequiringRender$]).pipe(
                filter(([accumulatedData]) => Boolean(accumulatedData.unifiedMapNode)),
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
