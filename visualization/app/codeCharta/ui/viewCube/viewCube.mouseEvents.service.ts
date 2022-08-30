import { hierarchy } from "d3-hierarchy"
import { CodeMapMouseEventService, CursorType } from "../codeMap/codeMap.mouseEvent.service"
import { Group, Mesh, PerspectiveCamera, Raycaster, Vector2, WebGLRenderer } from "three"
import { isLeaf } from "../../util/codeMapHelper"
// eslint-disable-next-line no-duplicate-imports
import * as Three from "three"
import oc from "three-orbit-controls"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { EventEmitter } from "tsee"
import { Inject, Injectable } from "@angular/core"
import { ThreeOrbitControlsServiceToken } from "../../services/ajs-upgraded-providers"

type ViewCubeEvents = {
	viewCubeEventPropagation: (data: { event: MouseEvent; type: string }) => void
	viewCubeHoveredEvent: (data: { cube: Mesh }) => void
	viewCubeUnHoveredEvent: (data: undefined) => void
	viewCubeClicked: (data: { cube: Mesh }) => void
}

@Injectable({ providedIn: "root" })
export class ViewCubeMouseEventsService {
	private eventEmitter = new EventEmitter<ViewCubeEvents>()

	private cubeGroup: Group
	private camera: PerspectiveCamera
	private renderer: WebGLRenderer
	private currentlyHovered: Mesh | null = null
	private controls: OrbitControls
	private isDragging = false

	constructor(@Inject(ThreeOrbitControlsServiceToken) private threeOrbitControlsService: ThreeOrbitControlsService) {}

	init(cubeGroup: Group, camera: PerspectiveCamera, renderer: WebGLRenderer) {
		this.cubeGroup = cubeGroup
		this.camera = camera
		this.renderer = renderer
		this.initOrbitalControl(camera, renderer)
		this.initRendererEventListeners(renderer)
	}

	resetIsDragging() {
		this.isDragging = false
	}

	private initOrbitalControl(camera: PerspectiveCamera, renderer: WebGLRenderer) {
		const orbitControls = oc(Three)
		this.controls = new orbitControls(camera, renderer.domElement)
		this.controls.enableZoom = false
		this.controls.enableKeys = false
		this.controls.enablePan = false
		this.controls.rotateSpeed = 1
	}

	private initRendererEventListeners(renderer: WebGLRenderer) {
		renderer.domElement.addEventListener("mousemove", (event: MouseEvent) => this.onDocumentMouseMove(event))
		renderer.domElement.addEventListener("mouseup", (event: MouseEvent) => this.onDocumentMouseUp(event))
		renderer.domElement.addEventListener("mousedown", (event: MouseEvent) => this.onDocumentMouseClick(event, "mousedown"))
		renderer.domElement.addEventListener("dblclick", (event: MouseEvent) => this.onDocumentMouseClick(event, "dblclick"))
		renderer.domElement.addEventListener("mouseleave", (event: MouseEvent) => this.onWindowMouseLeave(event))
		renderer.domElement.addEventListener("mouseenter", () => this.onDocumentMouseEnter())
	}

	private onDocumentMouseClick(event: MouseEvent, mouseAction: string) {
		this.isDragging = true
		this.checkMouseIntersection(event, mouseAction)
	}

	private onWindowMouseLeave(event: MouseEvent) {
		if (event.relatedTarget == null || !(event.relatedTarget instanceof HTMLCanvasElement)) {
			this.enableRotation(false)
		}
	}

	private onDocumentMouseEnter() {
		this.enableRotation(true)
	}

	enableRotation(value: boolean) {
		this.controls.enableRotate = value
	}

	private checkMouseIntersection(event: MouseEvent, type: string) {
		if (!this.getCubeIntersectedByMouse(event)) {
			this.eventEmitter.emit("viewCubeEventPropagation", { type, event })
		}
	}

	private getCubeIntersectedByMouse(event: MouseEvent): Mesh | null {
		const vector = this.transformIntoCanvasVector(event)
		const ray = new Raycaster()
		ray.setFromCamera(vector, this.camera)
		const nodes: Group[] = []
		for (const node of hierarchy(this.cubeGroup)) {
			if (isLeaf(node)) {
				nodes.push(node.data)
			}
		}
		const [intersection] = ray.intersectObjects(nodes)
		return intersection ? (intersection.object as Mesh) : null
	}

	private transformIntoCanvasVector(event: MouseEvent) {
		const { domElement } = this.renderer

		const pixelRatio = this.renderer.getPixelRatio()
		const rect = domElement.getBoundingClientRect()
		const x = ((event.clientX - rect.left) / domElement.width) * pixelRatio * 2 - 1
		const y = -(((event.clientY - rect.top) / domElement.height) * pixelRatio) * 2 + 1
		return new Vector2(x, y)
	}

	propagateMovement() {
		if (this.isDragging) {
			const vec3 = this.camera.position
			this.threeOrbitControlsService.rotateCameraInVectorDirection(-vec3.x, -vec3.y, -vec3.z)
		}
		return this.isDragging
	}

	private onDocumentMouseMove(event: MouseEvent) {
		if (this.propagateMovement()) {
			return
		}
		const cube = this.getCubeIntersectedByMouse(event)
		if (cube) {
			if (this.currentlyHovered && cube.uuid !== this.currentlyHovered.uuid) {
				this.triggerViewCubeUnhoverEvent()
			} else if (!this.currentlyHovered) {
				this.triggerViewCubeHoverEvent(cube)
			}
		} else {
			if (this.currentlyHovered) {
				this.triggerViewCubeUnhoverEvent()
			}
			this.eventEmitter.emit("viewCubeEventPropagation", { type: "mousemove", event })
		}
	}

	private onDocumentMouseUp(event: MouseEvent) {
		this.isDragging = false
		const cube = this.getCubeIntersectedByMouse(event)
		if (cube) {
			this.eventEmitter.emit("viewCubeClicked", { cube })
		} else {
			this.eventEmitter.emit("viewCubeEventPropagation", { type: "mouseup", event })
		}
	}

	private triggerViewCubeHoverEvent(cube: Mesh) {
		this.currentlyHovered = cube
		CodeMapMouseEventService.changeCursorIndicator(CursorType.Pointer)
		this.eventEmitter.emit("viewCubeHoveredEvent", { cube })
	}

	private triggerViewCubeUnhoverEvent() {
		this.currentlyHovered = null
		CodeMapMouseEventService.changeCursorIndicator(CursorType.Default)
		this.eventEmitter.emit("viewCubeUnHoveredEvent", undefined)
	}

	subscribe<Key extends keyof ViewCubeEvents>(key: Key, callback: ViewCubeEvents[Key]) {
		this.eventEmitter.on(key, data => {
			callback(data)
		})
	}
}
