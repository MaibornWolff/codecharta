import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { asyncScheduler, combineLatest, filter, share, tap, throttleTime } from "rxjs"
import { CcState } from "../../../codeCharta.model"
import { CodeMapRenderService } from "../../../ui/codeMap/codeMap.render.service"
import { ThreeRendererService } from "../../../ui/codeMap/threeViewer/threeRenderer.service"
import { UploadFilesService } from "../../../ui/toolBar/uploadFilesButton/uploadFiles.service"
import { accumulatedDataSelector } from "../../selectors/accumulatedData/accumulatedData.selector"
import { actionsRequiringRerender } from "./actionsRequiringRerender"
import { setIsLoadingFile } from "../../store/appSettings/isLoadingFile/isLoadingFile.actions"
import { setIsLoadingMap } from "../../store/appSettings/isLoadingMap/isLoadingMap.actions"

export const maxFPS = 1000 / 60

@Injectable()
export class RenderCodeMapEffect {
    constructor(
        private store: Store<CcState>,
        private actions$: Actions,
        private uploadFilesService: UploadFilesService,
        private threeRendererService: ThreeRendererService,
        private codeMapRenderService: CodeMapRenderService
    ) {}

    private actionsRequiringRender$ = this.actions$.pipe(ofType(...actionsRequiringRerender))

    renderCodeMap$ = createEffect(
        () =>
            combineLatest([this.store.select(accumulatedDataSelector), this.actionsRequiringRender$]).pipe(
                filter(([accumulatedData]) => Boolean(accumulatedData.unifiedMapNode)),
                throttleTime(maxFPS, asyncScheduler, { leading: false, trailing: true }),
                tap(([accumulatedData]) => {
                    this.codeMapRenderService.render(accumulatedData.unifiedMapNode)
                    this.codeMapRenderService.scaleMap()
                    this.threeRendererService.render()
                }),
                share()
            ),
        { dispatch: false }
    )

    removeLoadingIndicatorAfterRender$ = createEffect(
        () =>
            this.renderCodeMap$.pipe(
                filter(() => !this.uploadFilesService.isUploading),
                tap(() => {
                    this.store.dispatch(setIsLoadingFile({ value: false }))
                    this.store.dispatch(setIsLoadingMap({ value: false }))
                })
            ),
        { dispatch: false }
    )
}
