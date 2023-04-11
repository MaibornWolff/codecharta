import { Injectable } from "@angular/core"
import { Camera, RGBAFormat, Scene, Vector2, WebGLInfo, WebGLRenderer, WebGLRenderTarget } from "three"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import { WEBGL } from "three/examples/jsm/WebGL"
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass"
import { CustomComposer } from "../rendering/postprocessor/customComposer"
import { isWhiteBackgroundSelector } from "../../../state/store/appSettings/isWhiteBackground/isWhiteBackground.selector"
import { SharpnessMode, CcState } from "../../../codeCharta.model"
import { fxaaShaderStrings } from "../rendering/shaders/loaders/fxaaShaderStrings"
import { State as StateService, Store } from "@ngrx/store"

@Injectable({ providedIn: "root" })
export class ThreeRendererService {
	static BACKGROUND_COLOR = {
		white: 0xff_ff_ff,
		normal: 0xf4_f4_eb
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

	constructor(private store: Store<CcState>, private state: StateService<CcState>) {}

	init(containerWidth: number, containerHeight: number, scene: Scene, camera: Camera) {
		this.scene = scene
		this.camera = camera
		this.initGL(containerWidth, containerHeight)
		this.store.select(isWhiteBackgroundSelector).subscribe(this.setBackgroundColorToState)
	}

	private setBackgroundColorToState = (isWhiteBackground: boolean) => {
		ThreeRendererService.CLEAR_COLOR = isWhiteBackground
			? ThreeRendererService.BACKGROUND_COLOR.white
			: ThreeRendererService.BACKGROUND_COLOR.normal
		this.renderer?.setClearColor(ThreeRendererService.CLEAR_COLOR, ThreeRendererService.CLEAR_ALPHA)
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
		switch (this.state.getValue().appSettings.sharpnessMode) {
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

	render() {
		const { scene, camera, composer, renderer } = this
		if (ThreeRendererService.enableFXAA) {
			composer?.render()
		} else {
			renderer?.render(scene, camera)
		}
	}
}
