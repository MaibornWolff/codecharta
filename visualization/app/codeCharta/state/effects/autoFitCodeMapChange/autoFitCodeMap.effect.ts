import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { combineLatest, filter, first, skip, switchMap, take, tap, withLatestFrom } from "rxjs"
import { CcState } from "../../../codeCharta.model"
import { ThreeMapControlsService } from "../../../ui/codeMap/threeViewer/threeMapControls.service"
import { resetCameraIfNewFileIsLoadedSelector } from "../../store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.selector"
import { RenderCodeMapEffect } from "../renderCodeMapEffect/renderCodeMap.effect"
import { selectorsTriggeringAutoFit } from "./selectorsTriggeringAutoFit"

@Injectable()
export class AutoFitCodeMapEffect {
    constructor(
        private readonly store: Store<CcState>,
        private readonly renderCodeMapEffect: RenderCodeMapEffect,
        private readonly threeMapControlsService: ThreeMapControlsService,
        private readonly actions$: Actions
    ) {}

    autoFitTo$ = createEffect(
        () =>
            combineLatest(selectorsTriggeringAutoFit.map(selector => this.store.select(selector))).pipe(
                skip(1), // initial map load is already fitted
                withLatestFrom(this.store.select(resetCameraIfNewFileIsLoadedSelector)),
                filter(([, resetCameraIfNewFileIsLoaded]) => resetCameraIfNewFileIsLoaded),
                switchMap(() => this.renderCodeMapEffect.renderCodeMap$.pipe(take(1))),
                tap(() => {
                    this.threeMapControlsService.autoFitTo()
                })
            ),
        { dispatch: false }
    )

    autoFitToWhenResetCameraIfNewFileIsLoadedSetToFalse$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType("StartWithGlobalOption:resetCameraIfNewFileIsLoadedSetToFalse"),
                first(),
                switchMap(() => this.renderCodeMapEffect.renderCodeMap$.pipe(take(1))),
                tap(() => {
                    this.threeMapControlsService.autoFitTo()
                })
            ),
        { dispatch: false }
    )
}
