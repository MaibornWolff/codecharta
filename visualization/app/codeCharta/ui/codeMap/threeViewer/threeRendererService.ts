import * as THREE from "three"
import { WebGLRenderer } from "three"
import { SettingsService } from "../../../state/settingsService/settings.service"
import { RecursivePartial, Settings } from "../../../codeCharta.model"
import { IRootScopeService } from "angular"
import { SettingsServiceSubscriber } from "../../../state/settingsService/settings.service.events"

export class ThreeRendererService implements SettingsServiceSubscriber {
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

	constructor(private settingsService: SettingsService, private $rootScope: IRootScopeService) {}

	public init(containerWidth: number, containerHeight: number) {
		this.renderer = new THREE.WebGLRenderer(ThreeRendererService.RENDER_OPTIONS)
		SettingsService.subscribe(this.$rootScope, this)
		this.setCurrentClearColorFromSettings(this.settingsService.getSettings())
		this.renderer.setSize(containerWidth, containerHeight)
		this.renderer.setClearColor(ThreeRendererService.CLEAR_COLOR, ThreeRendererService.CLEAR_ALPHA)
	}

	public setCurrentClearColorFromSettings(settings: Settings) {
		if (settings.appSettings.isWhiteBackground) {
			ThreeRendererService.CLEAR_COLOR = ThreeRendererService.BACKGROUND_COLOR.white
		} else {
			ThreeRendererService.CLEAR_COLOR = ThreeRendererService.BACKGROUND_COLOR.normal
		}
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>) {
		this.setCurrentClearColorFromSettings(settings)
		this.renderer.setClearColor(ThreeRendererService.CLEAR_COLOR, ThreeRendererService.CLEAR_ALPHA)
	}
}
