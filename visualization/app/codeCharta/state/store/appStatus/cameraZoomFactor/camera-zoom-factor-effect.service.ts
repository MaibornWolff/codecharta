import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { tap, withLatestFrom } from "rxjs/operators"
import { Store } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"
import { ThreeRendererService } from "../../../../ui/codeMap/threeViewer/threeRenderer.service"
import { setCameraZoomFactor, zoomIn, zoomOut } from "./cameraZoomFactor.actions"
import { cameraZoomFactorSelector } from "./cameraZoomFactor.selector"
import { ThreeCameraService } from "../../../../ui/codeMap/threeViewer/threeCamera.service"
import { CodeMapLabelService } from "../../../../ui/codeMap/codeMap.label.service"

@Injectable()
export class CameraZoomFactorEffect {
    constructor(
        private actions$: Actions,
        private store: Store<CcState>,
        private threeRendererService: ThreeRendererService,
        private threeCameraService: ThreeCameraService,
        private codeMapLabelService: CodeMapLabelService
    ) {}

    setZoom = createEffect(
        () =>
            this.actions$.pipe(
                ofType(setCameraZoomFactor, zoomIn, zoomOut),
                withLatestFrom(this.store.select(cameraZoomFactorSelector)),
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                tap(([action, zoom]) => {
                    this.threeCameraService.setZoomFactor(zoom)
                    this.codeMapLabelService.onCameraChanged()
                    this.threeRendererService.render()
                })
            ),
        { dispatch: false }
    )
}
