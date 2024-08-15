import { ThreeCameraService } from "./threeCamera.service"
import { Injectable } from "@angular/core"
import { Box3, Mesh, MeshNormalMaterial, PerspectiveCamera, Vector3, Sphere, BoxGeometry } from "three"
import { ThreeSceneService } from "./threeSceneService"
import { MapControls } from "three/examples/jsm/controls/MapControls"
import { ThreeRendererService } from "./threeRenderer.service"
import { EventEmitter } from "../../../util/EventEmitter"

type CameraChangeEvents = {
    onCameraChanged: (data: { camera: PerspectiveCamera }) => void
}

@Injectable({ providedIn: "root" })
export class ThreeMapControlsService {
    static CAMERA_CHANGED_EVENT_NAME = "camera-changed"

    controls: MapControls
    private eventEmitter = new EventEmitter<CameraChangeEvents>()

    constructor(
        private threeCameraService: ThreeCameraService,
        private threeSceneService: ThreeSceneService,
        private threeRendererService: ThreeRendererService
    ) {}

    setControlTarget(cameraTarget: Vector3) {
        this.controls.target.set(cameraTarget.x, cameraTarget.y, cameraTarget.z)
    }

    rotateCameraInVectorDirection(x: number, y: number, z: number) {
        const zoom = this.getZoom()
        this.lookAtDirectionFromTarget(x, y, z)
        this.applyOldZoom(zoom)

        this.threeRendererService.render()
        this.onInput(this.threeCameraService.camera)
    }

    autoFitTo() {
        setTimeout(() => {
            const boundingSphere = this.getBoundingSphere()

            const length = this.cameraPerspectiveLengthCalculation(boundingSphere)
            const cameraReference = this.threeCameraService.camera

            cameraReference.position.set(length, length, boundingSphere.center.z)

            this.controls.update()

            this.focusCameraViewToCenter(boundingSphere)
            this.threeRendererService.render()
            this.onInput(this.threeCameraService.camera)
        })
    }

    private cameraPerspectiveLengthCalculation(boundingSphere: Sphere) {
        const cameraReference = this.threeCameraService.camera

        //TODO: Scale Factor for object to camera ratio
        const scale = 1.3 // object size / display size
        const objectAngularSize = ((cameraReference.fov * Math.PI) / 180) * scale

        const distanceToCamera = boundingSphere.radius / Math.tan(objectAngularSize / 2)
        return Math.sqrt(Math.pow(distanceToCamera, 2) + Math.pow(distanceToCamera, 2))
    }

    private focusCameraViewToCenter(boundingSphere: Sphere) {
        const boundingSphereCenter: Vector3 = boundingSphere.center.clone()

        boundingSphereCenter.setY(0)

        this.controls.target.set(boundingSphereCenter.x, boundingSphereCenter.y, boundingSphereCenter.z)

        this.threeCameraService.camera.lookAt(boundingSphereCenter)

        this.threeCameraService.camera.updateProjectionMatrix()
    }

    private getBoundingSphere() {
        return new Box3().setFromObject(this.threeSceneService.mapGeometry).getBoundingSphere(new Sphere())
    }

    private lookAtDirectionFromTarget(x: number, y: number, z: number) {
        this.threeCameraService.camera.position.set(this.controls.target.x, this.controls.target.y, this.controls.target.z)

        const alignmentCube = new Mesh(new BoxGeometry(20, 20, 20), new MeshNormalMaterial())

        this.threeSceneService.scene.add(alignmentCube)

        alignmentCube.position.set(this.controls.target.x, this.controls.target.y, this.controls.target.z)

        alignmentCube.translateX(x)
        alignmentCube.translateY(y)
        alignmentCube.translateZ(z)

        this.threeCameraService.camera.lookAt(alignmentCube.getWorldPosition(alignmentCube.position))
        this.threeSceneService.scene.remove(alignmentCube)
    }

    private getZoom() {
        return this.threeCameraService.camera.position.distanceTo(this.controls.target)
    }

    private applyOldZoom(oldZoom: number) {
        this.threeCameraService.camera.translateZ(oldZoom)
    }

    init(domElement: HTMLCanvasElement) {
        this.controls = new MapControls(this.threeCameraService.camera, domElement)
        this.controls.zoomToCursor = true
        this.controls.listenToKeyEvents(window)
        this.controls.addEventListener("change", () => {
            this.onInput(this.threeCameraService.camera)
            this.threeRendererService.render()
        })
    }

    onInput(camera: PerspectiveCamera) {
        this.setControlTarget(this.controls.target)
        this.eventEmitter.emit("onCameraChanged", { camera })
    }

    subscribe<Key extends keyof CameraChangeEvents>(key: Key, callback: CameraChangeEvents[Key]) {
        this.eventEmitter.on(key, data => {
            callback(data)
        })
    }
}
