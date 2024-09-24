import { ThreeCameraService } from "./threeCamera.service"
import { Injectable } from "@angular/core"
import { Box3, Mesh, MeshNormalMaterial, PerspectiveCamera, Vector3, Sphere, BoxGeometry, MOUSE } from "three"
import { ThreeSceneService } from "./threeSceneService"
import { MapControls } from "three/examples/jsm/controls/MapControls"
import { ThreeRendererService } from "./threeRenderer.service"
import { EventEmitter } from "../../../util/EventEmitter"
import { BehaviorSubject } from "rxjs"

type CameraChangeEvents = {
    onCameraChanged: (data: { camera: PerspectiveCamera }) => void
}

@Injectable({ providedIn: "root" })
export class ThreeMapControlsService {
    static CAMERA_CHANGED_EVENT_NAME = "camera-changed"
    MAX_ZOOM = 200
    MIN_ZOOM = 10

    controls: MapControls
    private eventEmitter = new EventEmitter<CameraChangeEvents>()
    zoomPercentage$ = new BehaviorSubject<number>(100)
    positionBeforeFocus: Vector3

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
            if (!boundingSphere || boundingSphere.radius === -1) {
                return
            }

            const length = this.cameraPerspectiveLengthCalculation(boundingSphere)
            const cameraReference = this.threeCameraService.camera

            cameraReference.position.set(length, length, boundingSphere.center.z)
            this.positionBeforeFocus = new Vector3(length, length, boundingSphere.center.z)

            this.controls.update()

            this.focusCameraViewToCenter(boundingSphere)
            this.threeRendererService.render()
            this.onInput(this.threeCameraService.camera)

            const scale = 1.3 // object size / display size

            this.controls.maxDistance = length * 4
            this.controls.minDistance = boundingSphere.radius / (10 * scale)

            this.setZoomPercentage(140)
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

    getBoundingSphere() {
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
        this.controls.mouseButtons = {
            LEFT: MOUSE.ROTATE,
            MIDDLE: MOUSE.DOLLY,
            RIGHT: MOUSE.PAN
        }

        window.addEventListener("wheel", event => {
            this.controls.zoomToCursor = event.deltaY <= 0
        })
      
        this.controls.maxPolarAngle = Math.PI / 2
        this.controls.listenToKeyEvents(window)
        this.controls.addEventListener("change", () => {
            this.onInput(this.threeCameraService.camera)
            this.updateZoomPercentage()
            this.threeRendererService.render()
        })
        this.updateZoomPercentage()
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

    getZoomPercentage(distance: number): number {
        const min = this.controls.minDistance
        const max = this.controls.maxDistance

        if (distance <= min) {
            return this.MAX_ZOOM
        }
        if (distance >= max) {
            return this.MIN_ZOOM
        }

        const range = max - min
        return this.MAX_ZOOM - ((distance - min) / range) * (this.MAX_ZOOM - this.MIN_ZOOM)
    }

    getDistanceFromZoomPercentage(percentage: number): number {
        const min = this.controls.minDistance
        const max = this.controls.maxDistance
        const range = max - min

        return min + ((this.MAX_ZOOM - percentage) / (this.MAX_ZOOM - this.MIN_ZOOM)) * range
    }

    updateZoomPercentage() {
        const distance = this.threeCameraService.camera.position.distanceTo(this.controls.target)
        const zoomFactor = this.getZoomPercentage(distance)
        this.zoomPercentage$.next(zoomFactor)
    }

    setZoomPercentage(zoom: number) {
        const newDistance = this.getDistanceFromZoomPercentage(zoom)
        const direction = new Vector3().subVectors(this.threeCameraService.camera.position, this.controls.target).normalize()
        this.threeCameraService.camera.position.copy(this.controls.target).add(direction.multiplyScalar(newDistance))
        this.controls.update()

        this.zoomPercentage$.next(zoom)
    }

    focusNode(nodePath: string) {
        this.positionBeforeFocus = this.threeCameraService.camera.position.clone()
        const mapMesh = this.threeSceneService.getMapMesh()
        const node = mapMesh.getBuildingByPath(nodePath)
        const boundingSphere = node.boundingBox.getBoundingSphere(new Sphere())

        this.ensureProperDistanceAndFocus(boundingSphere)
    }

    unfocusNode(callback?: () => void): void {
        if (!this.positionBeforeFocus) {
            return
        }

        const startPos = this.threeCameraService.camera.position.clone()
        const endPos = this.positionBeforeFocus.clone()
        const startTime = performance.now()
        const duration = 1000 // 1 second for the transition

        const animate = (currentTime: number) => {
            const elapsedTime = currentTime - startTime
            const t = Math.min(elapsedTime / duration, 1)

            const newPosition = new Vector3().lerpVectors(startPos, endPos, t)
            this.moveCameraToPosition(newPosition, this.controls.target, false)

            if (t < 1) {
                requestAnimationFrame(animate)
            } else if (callback) {
                callback()
            }
        }

        requestAnimationFrame(animate)
    }

    private ensureProperDistanceAndFocus(boundingSphere: Sphere) {
        const currentDistance = this.threeCameraService.camera.position.distanceTo(boundingSphere.center)
        const requiredDistance = this.cameraPerspectiveLengthCalculation(boundingSphere) * 1.8

        if (currentDistance < requiredDistance) {
            const zoomOutPosition = this.calculateCameraEndPosition(boundingSphere.center, boundingSphere.radius, false)
            this.animateCameraTransition({ center: zoomOutPosition, radius: requiredDistance } as Sphere, 500, () => {
                this.animateCameraTransition(boundingSphere, 1000)
            })
        } else {
            this.animateCameraTransition(boundingSphere, 1000)
        }
    }

    private animateCameraTransition(boundingSphere: Sphere, duration: number, callback?: () => void) {
        const { center, radius } = boundingSphere

        const startPos = this.threeCameraService.camera.position.clone()
        const endPos = this.calculateCameraEndPosition(center, radius, true)

        const startTime = performance.now()

        const animate = (currentTime: number) => {
            const elapsedTime = currentTime - startTime
            const t = Math.min(elapsedTime / duration, 1)

            const newPosition = new Vector3().lerpVectors(startPos, endPos, t)
            this.moveCameraToPosition(newPosition, center, false)

            if (t < 1) {
                requestAnimationFrame(animate)
            } else if (callback) {
                callback()
            }
        }

        requestAnimationFrame(animate)
    }

    private calculateCameraEndPosition(center: Vector3, radius: number, isFocusing: boolean): Vector3 {
        const currentCameraPosition = this.threeCameraService.camera.position.clone()
        const direction = this.controls.target.clone().sub(currentCameraPosition).normalize()

        const distance = this.cameraPerspectiveLengthCalculation({ center, radius } as Sphere) * (isFocusing ? 1.8 : 1)

        return center.clone().sub(direction.multiplyScalar(distance))
    }

    private moveCameraToPosition(position: Vector3, target: Vector3, render = true) {
        const camera = this.threeCameraService.camera

        camera.position.copy(position)
        camera.lookAt(target)

        this.controls.target.copy(target)
        this.controls.update()

        if (render) {
            this.threeRendererService.render()
        }

        this.onInput(camera)
    }
}
