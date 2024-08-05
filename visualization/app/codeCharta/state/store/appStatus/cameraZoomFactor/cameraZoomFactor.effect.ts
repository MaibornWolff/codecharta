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
import { CodeMapMouseEventService } from "../../../../ui/codeMap/codeMap.mouseEvent.service"
import { ThreeOrbitControlsService } from "../../../../ui/codeMap/threeViewer/threeOrbitControls.service"
import { Vector3 } from "three"

@Injectable()
export class CameraZoomFactorEffect {
    constructor(
        private actions$: Actions,
        private store: Store<CcState>,
        private threeRendererService: ThreeRendererService,
        private threeCameraService: ThreeCameraService,
        private codeMapLabelService: CodeMapLabelService,
        private codeMapMouseEventService: CodeMapMouseEventService,
        private threeOrbitControlsService: ThreeOrbitControlsService
    ) {}

    setZoom = createEffect(
        () =>
            this.actions$.pipe(
                ofType(setCameraZoomFactor, zoomIn, zoomOut),
                withLatestFrom(this.store.select(cameraZoomFactorSelector)),
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                tap(([action, zoom]) => {
                    const camera = this.threeCameraService.camera
                    const controls = this.threeOrbitControlsService.controls
                    const mouseCoordinates = this.codeMapMouseEventService.getmouse3D()

                    const newPosition = new Vector3().lerpVectors(camera.position, mouseCoordinates, 0.25)
                    camera.position.copy(newPosition)

                    controls.target.copy(mouseCoordinates)
                    controls.update()

                    this.threeCameraService.setZoomFactor(zoom)
                    this.codeMapLabelService.onCameraChanged()
                    this.threeRendererService.render()
                })
            ),
        { dispatch: false }
    )
}
