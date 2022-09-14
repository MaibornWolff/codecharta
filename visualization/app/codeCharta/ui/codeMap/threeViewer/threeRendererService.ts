import { Camera, RGBAFormat, Scene, Vector2, WebGLInfo, WebGLRenderer, WebGLRenderTarget } from "three"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../state/store.service"
import {
	IsWhiteBackgroundService,
	IsWhiteBackgroundSubscriber
} from "../../../state/store/appSettings/isWhiteBackground/isWhiteBackground.service"
import { CustomComposer } from "../rendering/postprocessor/customComposer"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import { fxaaShaderStrings } from "../rendering/shaders/loaders/fxaaShaderStrings"
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass"
import { WEBGL } from "three/examples/jsm/WebGL"
import { SharpnessMode } from "../../../codeCharta.model"
export class ThreeRendererService implements IsWhiteBackgroundSubscriber {
	static BACKGROUND_COLOR = {
		white: 0xff_ff_ff,
		normal: 0xee_ee_dd
	}

	static CLEAR_COLOR = ThreeRendererService.BACKGROUND_COLOR.normal

	static CLEAR_ALPHA = 1

	static RENDER_OPTIONS: WebGLContextAttributes = {
		antialias: true,
		preserveDrawingBuffer: true,
		alpha: true
	}

	static enableFXAA = false
	static setPixelRatio = false

	static instance: ThreeRendererService

	composer: CustomComposer
	renderer: WebGLRenderer
	scene: Scene
	camera: Camera

	constructor(private storeService: StoreService, private $rootScope: IRootScopeService) {
		"ngInject"
		ThreeRendererService.instance = this
		IsWhiteBackgroundService.subscribe(this.$rootScope, this)
	}

	init(containerWidth: number, containerHeight: number, scene: Scene, camera: Camera) {
		this.scene = scene
		this.camera = camera
		this.initGL(containerWidth, containerHeight)
		this.onIsWhiteBackgroundChanged(this.storeService.getState().appSettings.isWhiteBackground)
	}

	private initGL = (containerWidth: number, containerHeight: number) => {
		this.setGLOptions()
		this.renderer = new WebGLRenderer(ThreeRendererService.RENDER_OPTIONS)
		if (ThreeRendererService.setPixelRatio) {
			this.renderer.setPixelRatio(window.devicePixelRatio)
		}
		if (ThreeRendererService.enableFXAA) {
			if (WEBGL.isWebGL2Available) {
				const size = this.renderer.getDrawingBufferSize(new Vector2())
				const renderTarget = new WebGLRenderTarget(size.width, size.height, {
					format: RGBAFormat
				})
				this.composer = new CustomComposer(this.renderer, renderTarget)
			} else {
				this.composer = new CustomComposer(this.renderer)
			}
		}
		this.renderer.setSize(containerWidth, containerHeight)
		this.renderer.domElement.id = "codeMapScene"

		if (ThreeRendererService.enableFXAA) {
			this.initComposer()
		}
	}

	private setGLOptions = () => {
		const state = this.storeService.getState()
		const {
			appSettings: { sharpnessMode }
		} = state
		switch (sharpnessMode) {
			case SharpnessMode.Standard:
				ThreeRendererService.RENDER_OPTIONS.antialias = true
				ThreeRendererService.enableFXAA = false
				ThreeRendererService.setPixelRatio = false
				break
			case SharpnessMode.PixelRatioNoAA:
				ThreeRendererService.RENDER_OPTIONS.antialias = false
				ThreeRendererService.enableFXAA = false
				ThreeRendererService.setPixelRatio = true
				break
			case SharpnessMode.PixelRatioFXAA:
				ThreeRendererService.RENDER_OPTIONS.antialias = false
				ThreeRendererService.enableFXAA = true
				ThreeRendererService.setPixelRatio = true
				break
			case SharpnessMode.PixelRatioAA:
				ThreeRendererService.RENDER_OPTIONS.antialias = true
				ThreeRendererService.enableFXAA = false
				ThreeRendererService.setPixelRatio = true
				break
		}
	}

	private initComposer = () => {
		const pixelRatio = this.renderer.getPixelRatio()

		this.composer.setSize(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio)
		const renderPass = new RenderPass(this.scene, this.camera)
		this.composer.addPass(renderPass)

		const effectFXAA = new ShaderPass(new fxaaShaderStrings())
		effectFXAA.renderToScreen = false
		effectFXAA.uniforms["resolution"].value.x = 1 / (window.innerWidth * pixelRatio)
		effectFXAA.uniforms["resolution"].value.y = 1 / (window.innerHeight * pixelRatio)
		this.composer.addPass(effectFXAA)
	}

	getInfo = (): WebGLInfo["render"] => {
		return ThreeRendererService.enableFXAA ? this.composer.getInfo() : this.renderer.info.render
	}

	getMemoryInfo = (): WebGLInfo["memory"] => {
		return ThreeRendererService.enableFXAA ? this.composer.getMemoryInfo() : this.renderer.info.memory
	}

	onIsWhiteBackgroundChanged(isWhiteBackground: boolean) {
		ThreeRendererService.CLEAR_COLOR = isWhiteBackground
			? ThreeRendererService.BACKGROUND_COLOR.white
			: ThreeRendererService.BACKGROUND_COLOR.normal
		this.renderer?.setClearColor(ThreeRendererService.CLEAR_COLOR, ThreeRendererService.CLEAR_ALPHA)
	}

	render() {
		const { scene, camera, composer, renderer } = this
		if (ThreeRendererService.enableFXAA) {
			composer?.render()
		} else {
			renderer?.render(scene, camera)
		}
	}
}
