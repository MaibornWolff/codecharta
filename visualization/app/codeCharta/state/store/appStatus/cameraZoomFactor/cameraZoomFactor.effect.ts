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
import { Vector3, Euler } from "three"

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
                    const targetFocusPoint = this.codeMapMouseEventService.getmouse3D().clone()
                    const initialZoom = this.threeCameraService.camera.zoom
                    const initialRotation = this.threeCameraService.camera.rotation.clone()
                    return this.smoothZoomAndFocus(targetZoom, initialZoom, targetFocusPoint, initialRotation)
                })
            ),
        { dispatch: false }
    )

    private smoothZoomAndFocus(targetZoom: number, initialZoom: number, targetFocusPoint: Vector3, initialRotation: Euler) {
        const duration = 500 // Duration of the animation in milliseconds
        const frameRate = 60 // Frames per second
        const frameInterval = 1000 / frameRate
        const zoomDifference = targetZoom - initialZoom
        const totalFrames = duration / frameInterval

        const camera = this.threeCameraService.camera

        const targetDirection = new Vector3().subVectors(targetFocusPoint, camera.position).normalize()
        const targetEuler = new Euler().setFromVector3(targetDirection)

        function easeInOutCubic(t: number): number {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        }

        return this.ngZone.runOutsideAngular(() =>
            interval(frameInterval).pipe(
                map(frame => {
                    if (frame >= totalFrames) {
                        return { zoom: targetZoom, rotation: targetEuler }
                    }
                    const progress = easeInOutCubic(frame / totalFrames)

                    const interpolatedZoom = initialZoom + zoomDifference * progress
                    const interpolatedRotation = new Euler(
                        initialRotation.x + (targetEuler.x - initialRotation.x) * progress,
                        initialRotation.y + (targetEuler.y - initialRotation.y) * progress,
                        initialRotation.z + (targetEuler.z - initialRotation.z) * progress
                    )

                    return { zoom: interpolatedZoom, rotation: interpolatedRotation }
                }),
                takeWhile(({ zoom }) => zoom !== targetZoom, true),
                tap(({ zoom, rotation }) => {
                    const controls = this.threeOrbitControlsService.controls

                    this.threeCameraService.setZoomFactor(zoom)
                    camera.rotation.copy(rotation)
                    controls.target.copy(targetFocusPoint)
                    controls.update()
                    this.codeMapLabelService.onCameraChanged()
                    this.threeRendererService.render()
                })
            )
        )
    }
}
