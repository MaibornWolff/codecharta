import { Injectable, NgZone } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { interval } from "rxjs"
import { map, switchMap, takeWhile, tap, withLatestFrom } from "rxjs/operators"
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
        private threeOrbitControlsService: ThreeOrbitControlsService,
        private ngZone: NgZone
    ) {}

    setZoom = createEffect(
        () =>
            this.actions$.pipe(
                ofType(setCameraZoomFactor, zoomIn, zoomOut),
                withLatestFrom(this.store.select(cameraZoomFactorSelector)),
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                switchMap(([action, targetZoom]) => {
                    const targetFocusPoint = this.codeMapMouseEventService.getMouse3D().clone()
                    const initialZoom = this.threeCameraService.camera.zoom
                    const initialFocusPoint = this.threeOrbitControlsService.controls.target.clone()
                    return this.smoothZoomAndFocus(targetZoom, initialZoom, targetFocusPoint, initialFocusPoint)
                })
            ),
        { dispatch: false }
    )

    private smoothZoomAndFocus(targetZoom: number, initialZoom: number, targetFocusPoint: Vector3, initialFocusPoint: Vector3) {
        const duration = 300 // Duration of the animation in milliseconds
        const frameRate = 60 // Frames per second
        const frameInterval = 1000 / frameRate
        const zoomDifference = targetZoom - initialZoom
        const totalFrames = duration / frameInterval

        function easeInOutCubic(t: number): number {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        }

        return this.ngZone.runOutsideAngular(() =>
            interval(frameInterval).pipe(
                map(frame => {
                    if (frame >= totalFrames) {
                        return { zoom: targetZoom, focusPoint: targetFocusPoint }
                    }
                    const progress = easeInOutCubic(frame / totalFrames)

                    const interpolatedZoom = initialZoom + zoomDifference * progress
                    const interpolatedFocusPoint = new Vector3().lerpVectors(initialFocusPoint, targetFocusPoint, progress)

                    return { zoom: interpolatedZoom, focusPoint: interpolatedFocusPoint.clone() }
                }),
                takeWhile(({ zoom }) => zoom !== targetZoom, true),
                tap(({ zoom, focusPoint }) => {
                    const controls = this.threeOrbitControlsService.controls

                    this.threeCameraService.setZoomFactor(zoom)

                    controls.target.copy(focusPoint)
                    controls.update()

                    this.codeMapLabelService.onCameraChanged()
                    this.threeRendererService.render()
                })
            )
        )
    }
}
