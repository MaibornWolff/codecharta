import { Injectable } from "@angular/core"
import { PerspectiveCamera, Vector3 } from "three"

@Injectable({ providedIn: "root" })
export class ThreeCameraService {
    static VIEW_ANGLE = 45
    static NEAR = 50
    static FAR = 200_000 //TODO optimize renderer for far objects
    static MAX_ZOOM_Factor = 5
    static MIN_ZOOM_Factor = 0.1
    static ZOOM_STEP = 0.1
    camera: PerspectiveCamera
    zoomFactor: number

    init(containerWidth: number, containerHeight: number) {
        const aspect = containerWidth / containerHeight
        this.camera = new PerspectiveCamera(ThreeCameraService.VIEW_ANGLE, aspect, ThreeCameraService.NEAR, ThreeCameraService.FAR)
        this.setPosition(new Vector3(0, 300, 1000))
        this.zoomFactor = this.camera.zoom
    }

    setPosition(position: Vector3) {
        this.camera.position.set(position.x, position.y, position.z)
        this.camera.lookAt(0, 0, 0)
    }

    setZoomFactor(zoomFactor: number) {
        this.camera.zoom = zoomFactor
        this.zoomFactor = zoomFactor
        this.camera.updateProjectionMatrix()
    }

    zoomIn() {
        this.setZoomFactor(Math.min(this.zoomFactor + ThreeCameraService.ZOOM_STEP, ThreeCameraService.MAX_ZOOM_Factor))
    }

    zoomOut() {
        this.setZoomFactor(Math.max(this.zoomFactor - ThreeCameraService.ZOOM_STEP, ThreeCameraService.MIN_ZOOM_Factor))
    }
}
