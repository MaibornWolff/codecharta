import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { switchMap, filter, skip, take, tap, combineLatest, withLatestFrom, first } from "rxjs"
import { CcState } from "../../../codeCharta.model"
import { ThreeMapControlsService } from "../../../ui/codeMap/threeViewer/threeMapControls.service"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { layoutAlgorithmSelector } from "../../store/appSettings/layoutAlgorithm/layoutAlgorithm.selector"
import { resetCameraIfNewFileIsLoadedSelector } from "../../store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.selector"
import { RenderCodeMapEffect } from "../renderCodeMapEffect/renderCodeMap.effect"

@Injectable()
export class AutoFitCodeMapEffect {
    constructor(
        private store: Store<CcState>,
        private renderCodeMapEffect: RenderCodeMapEffect,
        private threeMapControlsService: ThreeMapControlsService,
        private actions$: Actions
    ) {}

    autoFitTo$ = createEffect(
        () =>
            combineLatest([this.store.select(visibleFileStatesSelector), this.store.select(layoutAlgorithmSelector)]).pipe(
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
