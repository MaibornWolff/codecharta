import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { asyncScheduler, combineLatest, debounceTime, filter, share, tap, throttleTime } from "rxjs"
import { CcState } from "../../../codeCharta.model"
import { CodeMapRenderService, ThreeRendererService } from "../../../features/codeMap/facade"
import { ScenariosFacade } from "../../../features/scenarios/facade"
import { UploadFilesService } from "../../../features/navBar/facade"
import { accumulatedDataSelector } from "../../selectors/accumulatedData/accumulatedData.selector"
import { actionsRequiringRerender } from "./actionsRequiringRerender"
import { setIsLoadingFile } from "../../store/appSettings/isLoadingFile/isLoadingFile.actions"
import { setIsLoadingMap } from "../../store/appSettings/isLoadingMap/isLoadingMap.actions"
import { clearPendingHeavyDispatch } from "../../../util/dispatchAfterPaint"

export const maxFPS = 1000 / 60
export const LOADING_INDICATOR_QUIET_PERIOD_MS = 350

@Injectable()
export class RenderCodeMapEffect {
    constructor(
        private readonly store: Store<CcState>,
        private readonly actions$: Actions,
        private readonly scenariosFacade: ScenariosFacade,
        private readonly uploadFilesService: UploadFilesService,
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
                    this.codeMapRenderService.render(accumulatedData.unifiedMapNode)
                    this.codeMapRenderService.scaleMap()
                    this.threeRendererService.render()
                    clearPendingHeavyDispatch()
                }),
                share()
            ),
        { dispatch: false }
    )

    removeLoadingIndicatorAfterRender$ = createEffect(
        () =>
            this.renderCodeMap$.pipe(
                filter(() => !this.uploadFilesService.isUploading && !this.scenariosFacade.isApplying),
                // Wait for the burst of late-arriving renders (blacklist apply, autoFit) to settle
                // before hiding the spinner, otherwise the user sees the map jump after the spinner clears.
                debounceTime(LOADING_INDICATOR_QUIET_PERIOD_MS),
                tap(() => {
                    this.store.dispatch(setIsLoadingFile({ value: false }))
                    this.store.dispatch(setIsLoadingMap({ value: false }))
                })
            ),
        { dispatch: false }
    )
}
