import { IRootScopeService } from "angular"
import { hierarchy } from "d3"
import { CodeMapMouseEventService, CursorType } from "../codeMap/codeMap.mouseEvent.service"
import { Group, Mesh, PerspectiveCamera, Raycaster, Vector2, WebGLRenderer } from "three"

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

	constructor(private $rootScope: IRootScopeService) {}

	init(cubeGroup: Group, camera: PerspectiveCamera, renderer: WebGLRenderer) {
		this.cubeGroup = cubeGroup
		this.camera = camera
		this.renderer = renderer
		this.initRendererEventListeners(renderer)
	}

	private initRendererEventListeners(renderer: WebGLRenderer) {
		renderer.domElement.addEventListener("mousemove", (event: MouseEvent) => this.onDocumentMouseMove(event))
		renderer.domElement.addEventListener("mouseup", (event: MouseEvent) => this.onDocumentMouseUp(event))
		renderer.domElement.addEventListener("mousedown", (event: MouseEvent) => this.checkMouseIntersection(event, "mousedown"))
		renderer.domElement.addEventListener("dblclick", (event: MouseEvent) => this.checkMouseIntersection(event, "dblclick"))
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
		const h = hierarchy(this.cubeGroup)
		const [intersection] = ray.intersectObjects(h.leaves().map(x => x.data))
		return intersection ? (intersection.object as Mesh) : null
	}

	private transformIntoCanvasVector(event: MouseEvent) {
		var rect = this.renderer.domElement.getBoundingClientRect();
		const x = ((event.clientX - rect.left) / this.renderer.domElement.width) * 2 - 1
		const y = -((event.clientY - rect.top) / this.renderer.domElement.height) * 2 + 1
		return new Vector2(x, y)
	}

	private onDocumentMouseMove(event: MouseEvent) {
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
