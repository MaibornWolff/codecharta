import { IRootScopeService } from "angular"
import { hierarchy } from "d3-hierarchy"
import { CodeMapMouseEventService, CursorType } from "../codeMap/codeMap.mouseEvent.service"
import { Group, Mesh, PerspectiveCamera, Raycaster, Vector2, WebGLRenderer } from "three"
import { isLeaf } from "../../util/codeMapHelper"
// eslint-disable-next-line no-duplicate-imports
import * as Three from "three"
import oc from "three-orbit-controls"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"

export interface ViewCubeEventPropagationSubscriber {
	onViewCubeEventPropagation(eventType: string, event: MouseEvent)
}

export interface ViewCubeEventSubscriber {
	onCubeHovered(cube: Mesh)
	onCubeUnhovered()
	onCubeClicked(cube: Mesh)
}

export class ViewCubeMouseEventsService {
	private static VIEW_CUBE_EVENT_PROPAGATION_EVENT_NAME = "view-cube-event-propagation"
	private static VIEW_CUBE_HOVER_EVENT_NAME = "view-cube-hover-event"
	private static VIEW_CUBE_UNHOVER_EVENT_NAME = "view-cube-unhover-event"
	private static VIEW_CUBE_CLICK_EVENT_NAME = "view-cube-click-event"

	private cubeGroup: Group
	private camera: PerspectiveCamera
	private renderer: WebGLRenderer
	private currentlyHovered: Mesh | null = null
	private controls: OrbitControls
	private isDragging = false

	constructor(private $rootScope: IRootScopeService, private threeOrbitControlsService: ThreeOrbitControlsService) {}

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

	private checkMouseIntersection(event: MouseEvent, mouseAction: string) {
		if (!this.getCubeIntersectedByMouse(event)) {
			this.triggerViewCubeEventPropagation(mouseAction, event)
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
			this.triggerViewCubeEventPropagation("mousemove", event)
		}
	}

	private onDocumentMouseUp(event: MouseEvent) {
		this.isDragging = false
		const cube = this.getCubeIntersectedByMouse(event)
		if (cube) {
			this.triggerViewCubeClickEvent(cube)
		} else {
			this.triggerViewCubeEventPropagation("mouseup", event)
		}
	}

	private triggerViewCubeEventPropagation(type: string, event: MouseEvent) {
		this.$rootScope.$broadcast(ViewCubeMouseEventsService.VIEW_CUBE_EVENT_PROPAGATION_EVENT_NAME, {
			e: event,
			type
		})
	}

	private triggerViewCubeHoverEvent(cube: Mesh) {
		this.currentlyHovered = cube
		CodeMapMouseEventService.changeCursorIndicator(CursorType.Pointer)
		this.$rootScope.$broadcast(ViewCubeMouseEventsService.VIEW_CUBE_HOVER_EVENT_NAME, { cube })
	}

	private triggerViewCubeUnhoverEvent() {
		this.currentlyHovered = null
		CodeMapMouseEventService.changeCursorIndicator(CursorType.Default)
		this.$rootScope.$broadcast(ViewCubeMouseEventsService.VIEW_CUBE_UNHOVER_EVENT_NAME)
	}

	private triggerViewCubeClickEvent(cube: Mesh) {
		this.$rootScope.$broadcast(ViewCubeMouseEventsService.VIEW_CUBE_CLICK_EVENT_NAME, { cube })
	}

	static subscribeToEventPropagation($rootScope: IRootScopeService, subscriber: ViewCubeEventPropagationSubscriber) {
		$rootScope.$on(
			ViewCubeMouseEventsService.VIEW_CUBE_EVENT_PROPAGATION_EVENT_NAME,
			(_event_, parameters: { type: string; e: MouseEvent }) => {
				subscriber.onViewCubeEventPropagation(parameters.type, parameters.e)
			}
		)
	}

	static subscribeToViewCubeMouseEvents($rootScope: IRootScopeService, subscriber: ViewCubeEventSubscriber) {
		$rootScope.$on(ViewCubeMouseEventsService.VIEW_CUBE_HOVER_EVENT_NAME, (_event_, parameters: { cube: Mesh }) => {
			subscriber.onCubeHovered(parameters.cube)
		})

		$rootScope.$on(ViewCubeMouseEventsService.VIEW_CUBE_UNHOVER_EVENT_NAME, () => {
			subscriber.onCubeUnhovered()
		})

		$rootScope.$on(ViewCubeMouseEventsService.VIEW_CUBE_CLICK_EVENT_NAME, (_event_, parameters: { cube: Mesh }) => {
			subscriber.onCubeClicked(parameters.cube)
		})
	}
}
