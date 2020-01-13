import * as THREE from "three"
import { WebGLRenderer } from "three"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../state/store.service"
import {
	IsWhiteBackgroundService,
	IsWhiteBackgroundSubscriber
} from "../../../state/store/appSettings/isWhiteBackground/isWhiteBackground.service"

export class ThreeRendererService implements IsWhiteBackgroundSubscriber {
	public static BACKGROUND_COLOR = {
		white: 0xffffff,
		normal: 0xeeeedd
	}

	public static CLEAR_COLOR = ThreeRendererService.BACKGROUND_COLOR.normal

	public static CLEAR_ALPHA = 1

	public static RENDER_OPTIONS = {
		antialias: true,
		preserveDrawingBuffer: true
	}

	public renderer: WebGLRenderer

	constructor(private storeService: StoreService, private $rootScope: IRootScopeService) {}

	public init(containerWidth: number, containerHeight: number) {
		this.renderer = new THREE.WebGLRenderer(ThreeRendererService.RENDER_OPTIONS)
		IsWhiteBackgroundService.subscribe(this.$rootScope, this)
		this.renderer.setSize(containerWidth, containerHeight)
		this.onIsWhiteBackgroundChanged(this.storeService.getState().appSettings.isWhiteBackground)
	}

	public onIsWhiteBackgroundChanged(isWhiteBackground: boolean) {
		if (isWhiteBackground) {
			ThreeRendererService.CLEAR_COLOR = ThreeRendererService.BACKGROUND_COLOR.white
		} else {
			ThreeRendererService.CLEAR_COLOR = ThreeRendererService.BACKGROUND_COLOR.normal
		}
		this.renderer.setClearColor(ThreeRendererService.CLEAR_COLOR, ThreeRendererService.CLEAR_ALPHA)
	}
}
