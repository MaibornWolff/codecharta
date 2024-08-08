import { Injectable, NgZone } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { Observable } from "rxjs"
import { switchMap, withLatestFrom } from "rxjs/operators"
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
        const duration = 500 // Duration of the animation in milliseconds

        function easeInOutCubic(t: number): number {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        }

        return new Observable<void>(observer => {
            const startTime = performance.now()
            const frameHandler = (currentTime: number) => {
                const elapsed = currentTime - startTime
                const progressTime = elapsed / duration
                const progress = Math.min(easeInOutCubic(progressTime), 1)

                const zoom = initialZoom + (targetZoom - initialZoom) * progress
                const focusPoint = new Vector3().lerpVectors(initialFocusPoint, targetFocusPoint, progress)

                if (progress >= 1) {
                    observer.complete()
                    return
                }

                this.ngZone.runOutsideAngular(() => {
                    const controls = this.threeOrbitControlsService.controls
                    this.threeCameraService.setZoomFactor(zoom)
                    controls.target.copy(focusPoint)
                    controls.update()

                    this.codeMapLabelService.onCameraChanged()
                    this.threeRendererService.render()
                })

                requestAnimationFrame(frameHandler)
            }

            requestAnimationFrame(frameHandler)

            return () => observer.complete()
        })
    }
}
