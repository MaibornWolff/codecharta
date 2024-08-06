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
import { ThreeSceneService } from "../../../../ui/codeMap/threeViewer/threeSceneService"
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
        private threeSceneService: ThreeSceneService,
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
                    return this.smoothZoomAndFocus(targetZoom, initialZoom, targetFocusPoint)
                })
            ),
        { dispatch: false }
    )

    private smoothZoomAndFocus(targetZoom: number, initialZoom: number, targetFocusPoint: Vector3) {
        const duration = 500 // Duration of the animation in milliseconds
        const frameRate = 60 // Frames per second
        const frameInterval = 1000 / frameRate
        const zoomDifference = targetZoom - initialZoom
        const totalFrames = duration / frameInterval

        // Capture the current camera's direction vector
        const initialDirection = new Vector3()
        this.threeCameraService.camera.getWorldDirection(initialDirection)

        // Calculate the direction vector towards the target focus point
        const targetDirection = targetFocusPoint.clone().sub(this.threeCameraService.camera.position).normalize()

        return this.ngZone.runOutsideAngular(() =>
            interval(frameInterval).pipe(
                map(frame => {
                    if (frame >= totalFrames) {
                        return { zoom: targetZoom, focusPoint: targetFocusPoint }
                    }

                    const progress = frame / totalFrames
                    const interpolatedZoom = initialZoom + zoomDifference * progress

                    // Linearly interpolate between the initial and target direction vectors
                    const interpolatedDirection = new Vector3().lerpVectors(initialDirection, targetDirection, progress).normalize()

                    // Calculate the new focus point based on the interpolated direction
                    const interpolatedFocusPoint = this.threeCameraService.camera.position.clone().add(interpolatedDirection)

                    return { zoom: interpolatedZoom, focusPoint: interpolatedFocusPoint }
                }),
                takeWhile(({ zoom }) => zoom !== targetZoom, true),
                tap(({ zoom, focusPoint }) => {
                    const camera = this.threeCameraService.camera
                    const controls = this.threeOrbitControlsService.controls

                    // Update camera zoom and lookAt the interpolated focus point
                    camera.zoom = zoom
                    camera.lookAt(focusPoint)
                    camera.updateProjectionMatrix()

                    controls.target.copy(focusPoint) // Ensure controls' target is updated
                    this.codeMapLabelService.onCameraChanged()
                    this.threeRendererService.render()
                })
            )
        )
    }
}
