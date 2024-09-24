import {
    AmbientLight,
    AxesHelper,
    BoxHelper,
    Color,
    DirectionalLight,
    Group,
    Mesh,
    PerspectiveCamera,
    Scene,
    Vector3,
    WebGLRenderer
} from "three"
import { ViewCubemeshGenerator } from "./viewCube.meshGenerator"
import { ThreeMapControlsService } from "../codeMap/threeViewer/threeMapControls.service"
import { ViewCubeMouseEventsService } from "./viewCube.mouseEvents.service"
import { Component, ElementRef, OnInit } from "@angular/core"

@Component({
    selector: "cc-view-cube",
    templateUrl: "./viewCube.component.html",
    styleUrls: ["./viewCube.component.scss"]
})
export class ViewCubeComponent implements OnInit {
    private lights: Group
    private cubeGroup: Group
    private camera: PerspectiveCamera
    private renderer: WebGLRenderer
    private scene: Scene
    private WIDTH = 200
    private HEIGHT = 200
    private LENGTH_VIEWCUBE = 1

    private hoverInfo = { cube: null, originalMaterial: null }

    private cubeDefinition = {
        front: null,
        middle: null,
        back: null
    }

    constructor(
        private elementReference: ElementRef,
        private threeMapControlsService: ThreeMapControlsService,
        private viewCubeMouseEvents: ViewCubeMouseEventsService
    ) {}

    ngOnInit() {
        this.initScene()
        this.initLights()
        this.initRenderer(this.elementReference.nativeElement)
        this.initCube()
        this.initAxesHelper()
        this.initCamera()
        this.viewCubeMouseEvents.init(this.cubeGroup, this.camera, this.renderer)

        this.threeMapControlsService.subscribe("onCameraChanged", this.onCameraChanged)
        this.viewCubeMouseEvents.subscribe("viewCubeHoveredEvent", this.onCubeHovered)
        this.viewCubeMouseEvents.subscribe("viewCubeUnHoveredEvent", this.onCubeUnhovered)
        this.viewCubeMouseEvents.subscribe("viewCubeClicked", this.onCubeClicked)
    }

    private initAxesHelper() {
        const axesHelper = new AxesHelper(1.3)
        const centerOffset = -(this.LENGTH_VIEWCUBE / 2) + 0.01
        axesHelper.position.x += centerOffset
        axesHelper.position.y += centerOffset
        axesHelper.position.z += centerOffset

        this.scene.add(axesHelper)
    }

    private initCube() {
        const { group, front, middle, back } = ViewCubemeshGenerator.buildCube(1.6)

        this.cubeGroup = group
        this.cubeDefinition.front = front
        this.cubeDefinition.middle = middle
        this.cubeDefinition.back = back

        const cubeBoundingBox = new BoxHelper(this.cubeGroup, new Color(0x00_00_00))

        this.scene.add(this.cubeGroup)
        this.scene.add(cubeBoundingBox)
    }

    onCameraChanged = (data: { camera: PerspectiveCamera }) => {
        const newCameraPosition = this.calculateCameraPosition(data.camera)
        this.setCameraPosition(newCameraPosition)
        this.renderer.render(this.scene, this.camera)
    }

    private setCameraPosition(cameraPosition: Vector3) {
        this.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)
        this.camera.lookAt(0, 0, 0)
        this.camera.updateProjectionMatrix()
    }

    private calculateCameraPosition(camera: PerspectiveCamera) {
        const codeMapTargetVector = this.threeMapControlsService.controls.target.clone()
        const codeMapCameraPosition = camera.position.clone()
        return codeMapCameraPosition.sub(codeMapTargetVector).normalize().multiplyScalar(3)
    }

    private initScene() {
        this.scene = new Scene()
    }

    private initRenderer(element: HTMLElement) {
        this.renderer = new WebGLRenderer({
            alpha: true,
            antialias: true
        })
        this.renderer.setSize(this.WIDTH, this.HEIGHT)
        this.renderer.setPixelRatio(window.devicePixelRatio) // geometry is low poly, no noticeable performance hit even with higher device pixel ratio
        element.appendChild(this.renderer.domElement)
    }

    private initCamera() {
        this.camera = new PerspectiveCamera(45, this.WIDTH / this.HEIGHT, 0.1, 1000)
        this.camera.position.z = 4
    }

    onCubeHovered = (data: { cube: Mesh }) => {
        this.hoverInfo = {
            cube: data.cube,
            originalMaterial: data.cube.material
        }
        this.hoverInfo.cube.material.emissive = new Color(0xff_ff_ff)
        this.renderer.render(this.scene, this.camera)
    }

    onCubeUnhovered = () => {
        this.hoverInfo.cube.material.emissive = new Color(0x00_00_00) //? NOTE why is this needed
        this.hoverInfo.cube = null
        this.renderer.render(this.scene, this.camera)
    }

    onCubeClicked = (data: { cube: Mesh }) => {
        switch (data.cube) {
            case this.cubeDefinition.front.top.middle:
                this.threeMapControlsService.rotateCameraInVectorDirection(0, -1, -1)
                break
            case this.cubeDefinition.front.top.left:
                this.threeMapControlsService.rotateCameraInVectorDirection(1, -1, -1)
                break
            case this.cubeDefinition.front.top.right:
                this.threeMapControlsService.rotateCameraInVectorDirection(-1, -1, -1)
                break

            case this.cubeDefinition.front.middle.middle:
                this.threeMapControlsService.rotateCameraInVectorDirection(0, 0, 0)
                break
            case this.cubeDefinition.front.middle.left:
                this.threeMapControlsService.rotateCameraInVectorDirection(1, 0, -1)
                break
            case this.cubeDefinition.front.middle.right:
                this.threeMapControlsService.rotateCameraInVectorDirection(-1, 0, -1)
                break

            case this.cubeDefinition.front.bottom.middle:
                this.threeMapControlsService.rotateCameraInVectorDirection(0, 1, -1)
                break
            case this.cubeDefinition.front.bottom.left:
                this.threeMapControlsService.rotateCameraInVectorDirection(1, 1, -1)
                break
            case this.cubeDefinition.front.bottom.right:
                this.threeMapControlsService.rotateCameraInVectorDirection(-1, 1, -1)
                break

            case this.cubeDefinition.middle.middle.right:
                this.threeMapControlsService.rotateCameraInVectorDirection(-1, 0, 0)
                break
            case this.cubeDefinition.middle.top.right:
                this.threeMapControlsService.rotateCameraInVectorDirection(-1, -1, 0)
                break
            case this.cubeDefinition.middle.bottom.right:
                this.threeMapControlsService.rotateCameraInVectorDirection(-1, 1, 0)
                break

            case this.cubeDefinition.middle.middle.left:
                this.threeMapControlsService.rotateCameraInVectorDirection(1, 0, 0)
                break
            case this.cubeDefinition.middle.top.left:
                this.threeMapControlsService.rotateCameraInVectorDirection(1, -1, 0)
                break
            case this.cubeDefinition.middle.bottom.left:
                this.threeMapControlsService.rotateCameraInVectorDirection(1, 1, 0)
                break

            case this.cubeDefinition.middle.top.middle:
                this.threeMapControlsService.rotateCameraInVectorDirection(0, -1, 0)
                break
            case this.cubeDefinition.middle.bottom.middle:
                this.threeMapControlsService.rotateCameraInVectorDirection(0, 1, 0)
                break

            case this.cubeDefinition.back.top.middle:
                this.threeMapControlsService.rotateCameraInVectorDirection(0, -1, 1)
                break
            case this.cubeDefinition.back.top.left:
                this.threeMapControlsService.rotateCameraInVectorDirection(1, -1, 1)
                break
            case this.cubeDefinition.back.top.right:
                this.threeMapControlsService.rotateCameraInVectorDirection(-1, -1, 1)
                break

            case this.cubeDefinition.back.middle.middle:
                this.threeMapControlsService.rotateCameraInVectorDirection(0, 0, 1)
                break
            case this.cubeDefinition.back.middle.left:
                this.threeMapControlsService.rotateCameraInVectorDirection(-1, 0, 1)
                break
            case this.cubeDefinition.back.middle.right:
                this.threeMapControlsService.rotateCameraInVectorDirection(1, 0, 1)
                break

            case this.cubeDefinition.back.bottom.middle:
                this.threeMapControlsService.rotateCameraInVectorDirection(0, 1, 1)
                break
            case this.cubeDefinition.back.bottom.left:
                this.threeMapControlsService.rotateCameraInVectorDirection(-1, 1, 1)
                break
            case this.cubeDefinition.back.bottom.right:
                this.threeMapControlsService.rotateCameraInVectorDirection(1, 1, 1)
                break
        }
    }

    private initLights() {
        this.lights = new Group()
        const ambilight = new AmbientLight(0x70_70_70, 2.8) // soft white light
        const light1 = new DirectionalLight(0xe0_e0_e0, 1.8)
        light1.position.set(50, 10, 8).normalize()

        const light2 = new DirectionalLight(0xe0_e0_e0, 1.8)
        light2.position.set(-50, 10, -8).normalize()

        this.lights.add(ambilight)
        this.lights.add(light1)
        this.lights.add(light2)

        this.scene.add(this.lights)
    }
}
