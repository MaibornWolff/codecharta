import * as THREE from "three"
import { IRootScopeService, IAngularEvent } from "angular"
import $ from "jquery"
import { hierarchy } from "d3"

export interface ViewCubeEventPropagationSubscriber {
	onViewCubeEventPropagation(eventType: string, event: MouseEvent)
}

export interface ViewCubeEventSubscriber {
	onCubeHovered(cube: THREE.Mesh)
	onCubeUnhovered()
	onCubeClicked(cube: THREE.Mesh)
}

export class ViewCubeMouseEventsService {
	private static VIEW_CUBE_EVENT_PROPAGATION_EVENT_NAME = "view-cube-event-propagation"
	private static VIEW_CUBE_HOVER_EVENT_NAME = "view-cube-hover-event"
	private static VIEW_CUBE_UNHOVER_EVENT_NAME = "view-cube-unhover-event"
	private static VIEW_CUBE_CLICK_EVENT_NAME = "view-cube-click-event"

	private cubeGroup: THREE.Group
	private camera: THREE.PerspectiveCamera
	private renderer: THREE.WebGLRenderer
	private currentlyHovered: THREE.Mesh | null = null

	constructor(private $rootScope: IRootScopeService) {}

	public init(cubeGroup: THREE.Group, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
		this.cubeGroup = cubeGroup
		this.camera = camera
		this.renderer = renderer
		this.initRendererEventListeners(renderer)
	}

	private initRendererEventListeners(renderer: THREE.WebGLRenderer) {
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

	private getCubeIntersectedByMouse(event: MouseEvent): THREE.Mesh | null {
		const vector = this.transformIntoCanvasVector(event)
		const ray = new THREE.Raycaster()
		ray.setFromCamera(vector, this.camera)
		const h = hierarchy<THREE.Mesh>(this.cubeGroup as THREE.Mesh)
		const intersection = ray.intersectObjects(h.leaves().map(x => x.data))[0]
		return intersection ? (intersection.object as THREE.Mesh) : null
	}

	private transformIntoCanvasVector(event: MouseEvent) {
		const topOffset = $(this.renderer.domElement).offset().top - $(window).scrollTop()
		const leftOffset = $(this.renderer.domElement).offset().left - $(window).scrollLeft()
		const mouse = {
			x: ((event.clientX - leftOffset) / this.renderer.domElement.width) * 2 - 1,
			y: -((event.clientY - topOffset) / this.renderer.domElement.height) * 2 + 1
		}
		return new THREE.Vector2(mouse.x, mouse.y)
	}

	private onDocumentMouseMove(event: MouseEvent) {
		const cube = this.getCubeIntersectedByMouse(event)
		if (cube) {
			if (this.currentlyHovered && cube.uuid !== this.currentlyHovered.uuid) {
				this.triggerViewCubeUnhoverEvent()
			} else {
				if (!this.currentlyHovered) {
					this.triggerViewCubeHoverEvent(cube)
				}
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
		this.$rootScope.$broadcast(ViewCubeMouseEventsService.VIEW_CUBE_EVENT_PROPAGATION_EVENT_NAME, { e: event, type })
	}

	private triggerViewCubeHoverEvent(cube: THREE.Mesh) {
		this.currentlyHovered = cube
		this.$rootScope.$broadcast(ViewCubeMouseEventsService.VIEW_CUBE_HOVER_EVENT_NAME, { cube })
	}

	private triggerViewCubeUnhoverEvent() {
		this.currentlyHovered = null
		this.$rootScope.$broadcast(ViewCubeMouseEventsService.VIEW_CUBE_UNHOVER_EVENT_NAME)
	}

	private triggerViewCubeClickEvent(cube: THREE.Mesh) {
		this.$rootScope.$broadcast(ViewCubeMouseEventsService.VIEW_CUBE_CLICK_EVENT_NAME, { cube })
	}

	public static subscribeToEventPropagation($rootScope: IRootScopeService, subscriber: ViewCubeEventPropagationSubscriber) {
		$rootScope.$on(
			ViewCubeMouseEventsService.VIEW_CUBE_EVENT_PROPAGATION_EVENT_NAME,
			(event: IAngularEvent, params: { type: string; e: MouseEvent }) => {
				subscriber.onViewCubeEventPropagation(params.type, params.e)
			}
		)
	}

	public static subscribeToViewCubeMouseEvents($rootScope: IRootScopeService, subscriber: ViewCubeEventSubscriber) {
		$rootScope.$on(ViewCubeMouseEventsService.VIEW_CUBE_HOVER_EVENT_NAME, (event: IAngularEvent, params: { cube: THREE.Mesh }) => {
			subscriber.onCubeHovered(params.cube)
		})

		$rootScope.$on(ViewCubeMouseEventsService.VIEW_CUBE_UNHOVER_EVENT_NAME, () => {
			subscriber.onCubeUnhovered()
		})

		$rootScope.$on(ViewCubeMouseEventsService.VIEW_CUBE_CLICK_EVENT_NAME, (event: IAngularEvent, params: { cube: THREE.Mesh }) => {
			subscriber.onCubeClicked(params.cube)
		})
	}
}
