import { Injectable } from "@angular/core"
import { BehaviorSubject } from "rxjs"
import { Box3, MOUSE, PerspectiveCamera, Sphere, Vector3 } from "three"
import { MapControls } from "three/addons/controls/MapControls.js"
import { bottomBarsInsetInPixels } from "../../util/barLayout"
import { EventEmitter } from "../../util/EventEmitter"
import { ThreeMapControlsStore } from "./stores/threeMapControls.store"
import { ThreeCameraService } from "./threeCamera.service"
import { ThreeRendererService } from "./threeRenderer.service"
import { ThreeSceneService } from "./threeSceneService"

type CameraChangeEvents = {
    onCameraChanged: (data: { camera: PerspectiveCamera }) => void
}

@Injectable({ providedIn: "root" })
export class ThreeMapControlsService {
    static readonly CAMERA_CHANGED_EVENT_NAME = "camera-changed"
    // Number of frames the fit will wait for the freshly loaded geometry before giving up.
    private static readonly MAX_AUTO_FIT_FRAMES = 10
    MAX_ZOOM = 200
    MIN_ZOOM = 10
    // The map's floor sits on y = 0: mapGeometry is positioned and scaled around that plane.
    private static readonly MAP_FLOOR_Y = 0

    controls: MapControls
    private readonly eventEmitter = new EventEmitter<CameraChangeEvents>()
    zoomPercentage$ = new BehaviorSubject<number>(100)

    constructor(
        private readonly threeCameraService: ThreeCameraService,
        private readonly threeSceneService: ThreeSceneService,
        private readonly threeRendererService: ThreeRendererService,
        private readonly threeMapControlsStore: ThreeMapControlsStore
    ) {}

    setControlTarget(cameraTarget: Vector3) {
        this.controls.target.set(cameraTarget.x, cameraTarget.y, cameraTarget.z)
    }

    updateControls() {
        this.controls.update()
    }

    rotateCameraInVectorDirection(x: number, y: number, z: number) {
        const zoom = this.getZoom()
        this.lookAtDirectionFromTarget(x, y, z)
        this.applyOldZoom(zoom)

        this.threeRendererService.render()
        this.onInput(this.threeCameraService.camera)
    }

    autoFitTo() {
        this.scheduleAutoFit(ThreeMapControlsService.MAX_AUTO_FIT_FRAMES)
    }

    private scheduleAutoFit(framesLeft: number) {
        requestAnimationFrame(() => {
            const boundingSphere = this.getBoundingSphere()
            if (boundingSphere.radius === -1) {
                // The freshly loaded map is not in the scene yet — retry next frame instead of silently
                // giving up, so a fit that is requested a touch early still lands once the geometry exists.
                if (framesLeft > 0) {
                    this.scheduleAutoFit(framesLeft - 1)
                }
                return
            }
            this.fitCameraToBoundingSphere(boundingSphere)
        })
    }

    private fitCameraToBoundingSphere(boundingSphere: Sphere) {
        const length = this.cameraPerspectiveLengthCalculation(boundingSphere)
        const cameraReference = this.threeCameraService.camera

        // The target and zoom limits must describe the new map before the camera is placed and
        // `controls.update()` runs: update() clamps the camera's distance-to-target into
        // [minDistance, maxDistance], and against the previous map's values that drags the camera
        // off the front-view axis — the skewed direction would then be locked in by
        // setZoomPercentage below.
        const scale = 1.3 // object size / display size
        this.controls.maxDistance = length * 4
        this.controls.minDistance = boundingSphere.radius / (10 * scale)

        cameraReference.position.set(length, length, boundingSphere.center.z)
        this.focusCameraViewToCenter(boundingSphere)
        this.updateControls()

        this.threeRendererService.render()
        this.onInput(this.threeCameraService.camera)

        this.setZoomPercentage(this.preferredCenterMapZoom())
        this.liftMapAboveBottomBars()
    }

    // The bars float over the canvas, so a map centred on the canvas is partly hidden behind them.
    // Moving camera and target together keeps the view direction and distance and lands the map in
    // the middle of the strip the bars leave visible.
    private liftMapAboveBottomBars() {
        const canvas = this.threeRendererService.renderer?.domElement
        if (!canvas) {
            return
        }
        const canvasBounds = canvas.getBoundingClientRect()
        const shiftInPixels = this.verticalShiftIntoVisibleStrip(canvasBounds, bottomBarsInsetInPixels(canvas))
        if (shiftInPixels <= 0 || canvasBounds.height <= 0) {
            return
        }

        const camera = this.threeCameraService.camera
        camera.updateMatrixWorld()
        const distanceToTarget = camera.position.distanceTo(this.controls.target)
        const visibleWorldHeight = 2 * distanceToTarget * Math.tan((camera.fov * Math.PI) / 360)
        const screenUp = new Vector3().setFromMatrixColumn(camera.matrixWorld, 1)
        const offset = screenUp.multiplyScalar((-visibleWorldHeight * shiftInPixels) / canvasBounds.height)

        camera.position.add(offset)
        this.controls.target.add(offset)
        this.updateControls()

        this.threeRendererService.render()
        this.onInput(camera)
    }

    private verticalShiftIntoVisibleStrip(canvasBounds: DOMRect, bottomInset: number): number {
        const visibleTop = Math.max(canvasBounds.top, 0)
        const visibleBottom = Math.min(canvasBounds.bottom, window.innerHeight - bottomInset)
        if (visibleBottom <= visibleTop) {
            return 0
        }
        return (canvasBounds.top + canvasBounds.bottom) / 2 - (visibleTop + visibleBottom) / 2
    }

    private preferredCenterMapZoom(): number {
        return Math.min(Math.max(this.threeMapControlsStore.getCenterMapZoom(), this.MIN_ZOOM), this.MAX_ZOOM)
    }

    private cameraPerspectiveLengthCalculation(boundingSphere: Sphere) {
        const cameraReference = this.threeCameraService.camera

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

        // Add tiny offset to avoid gimbal lock when looking straight down/up
        const adjustedX = x === 0 && z === 0 && y !== 0 ? -0.0001 : x

        const lookAtPoint = new Vector3(this.controls.target.x + adjustedX, this.controls.target.y + y, this.controls.target.z + z)

        this.threeCameraService.camera.lookAt(lookAtPoint)
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
        this.controls.zoomToCursor = true

        const updateZoomToCursor = (event: KeyboardEvent | MouseEvent) => {
            this.controls.zoomToCursor = !event.altKey
        }

        window.addEventListener("keydown", updateZoomToCursor)
        window.addEventListener("keyup", updateZoomToCursor)
        window.addEventListener("mousemove", updateZoomToCursor)

        this.controls.minPolarAngle = 0
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
        this.limitTiltToMapFloor()
        this.eventEmitter.emit("onCameraChanged", { camera })
    }

    // maxPolarAngle stops the camera level with the *target*, so a flat 90° only keeps it above the
    // map while the target sits on the floor. The fit drops the target below the floor to lift the
    // map clear of the bottom bars, which let the camera dip under the map and look at its
    // underside. Derive the angle that puts the camera exactly on the floor plane instead.
    private limitTiltToMapFloor() {
        const { target } = this.controls
        const distanceToTarget = this.threeCameraService.camera.position.distanceTo(target)
        if (distanceToTarget === 0) {
            return
        }

        const cosineAtFloor = (ThreeMapControlsService.MAP_FLOOR_Y - target.y) / distanceToTarget
        const angleAtFloor = Math.acos(Math.min(Math.max(cosineAtFloor, -1), 1))
        this.controls.maxPolarAngle = Math.min(angleAtFloor, Math.PI / 2)
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
        this.updateControls()

        this.zoomPercentage$.next(zoom)
    }
}
