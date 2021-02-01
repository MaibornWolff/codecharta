import { Camera, Scene, WebGLInfo, WebGLRenderer } from "three"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../state/store.service"
import {
	IsWhiteBackgroundService,
	IsWhiteBackgroundSubscriber
} from "../../../state/store/appSettings/isWhiteBackground/isWhiteBackground.service"
import { CustomComposer } from "../rendering/postprocessor/customComposer"
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { fxaaShaderStrings } from '../rendering/shaders/loaders/fxaaShaderString'
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass"
import { WEBGL } from "three/examples/jsm/WebGL"
import { SharpnessMode } from "../../../codeCharta.model"
export class ThreeRendererService implements IsWhiteBackgroundSubscriber {
	
	static BACKGROUND_COLOR = {
		white: 0xffffff,
		normal: 0xeeeedd
	}

	static CLEAR_COLOR = ThreeRendererService.BACKGROUND_COLOR.normal

	static CLEAR_ALPHA = 1

	static RENDER_OPTIONS = {
		antialias: true,
		preserveDrawingBuffer: true
	} as WebGLContextAttributes 

	static enableFXAA = false
	static setPixelRatio = false 

	composer: CustomComposer
	renderer: WebGLRenderer
	scene : Scene
	camera: Camera

	constructor(private storeService: StoreService, private $rootScope: IRootScopeService) {
		IsWhiteBackgroundService.subscribe(this.$rootScope, this)
	}

	init(containerWidth: number, containerHeight: number,scene : Scene, camera: Camera) {
		this.scene = scene
		this.camera = camera
		this.initGL(containerWidth,containerHeight)
		this.onIsWhiteBackgroundChanged(this.storeService.getState().appSettings.isWhiteBackground)
	}

	private initGL = (containerWidth: number, containerHeight: number) => {
		this.setGLOptions()
		const canvas = document.createElement( 'canvas' )
		const context = this.getWebGlContext(canvas)
		this.renderer = new WebGLRenderer( { canvas, context } );
		if (ThreeRendererService.setPixelRatio) {
			this.renderer.setPixelRatio(window.devicePixelRatio)
		}
		this.composer = new CustomComposer( this.renderer );
		this.renderer.setSize(containerWidth, containerHeight)
		if (ThreeRendererService.enableFXAA) {
			this.initComposer()
		}
	}

	private setGLOptions = () => {
		const state = this.storeService.getState()
		const { appSettings: { sharpnessMode } } = state
		switch (sharpnessMode) {
			case SharpnessMode.PixelRatioNoAA:
				ThreeRendererService.RENDER_OPTIONS.antialias =false
				ThreeRendererService.enableFXAA = false
				ThreeRendererService.setPixelRatio = true
				break
			case SharpnessMode.PixelRatioFXAA:
				ThreeRendererService.RENDER_OPTIONS.antialias =false
				ThreeRendererService.enableFXAA = true
				ThreeRendererService.setPixelRatio = true
				break
			case SharpnessMode.PixelRatioAA:
				ThreeRendererService.RENDER_OPTIONS.antialias =true
				ThreeRendererService.enableFXAA = false
				ThreeRendererService.setPixelRatio = true
				break
			case SharpnessMode.Standard:
				ThreeRendererService.RENDER_OPTIONS.antialias =true
				ThreeRendererService.enableFXAA = false
				ThreeRendererService.setPixelRatio = false
				break
		}
	}

	// using webgl2 instead of webgl 
	private getWebGlContext = (canvas : HTMLCanvasElement) => {
		return WEBGL.isWebGL2Available() ? canvas.getContext( 'webgl2', ThreeRendererService.RENDER_OPTIONS ) : 
			canvas.getContext( 'webgl', ThreeRendererService.RENDER_OPTIONS );
	}

	private initComposer = () => { 
		const pixelRatio = this.renderer.getPixelRatio()

		this.composer.setSize( window.innerWidth* pixelRatio, window.innerHeight* pixelRatio)
		const renderPass = new RenderPass( this.scene, this.camera )
		this.composer.addPass( renderPass )
		
		const effectFXAA = new ShaderPass( new fxaaShaderStrings() )
		effectFXAA.renderToScreen = false
        effectFXAA.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth* pixelRatio ) 
		effectFXAA.uniforms[ 'resolution' ].value.y = 1 / ( window.innerHeight* pixelRatio )
        this.composer.addPass( effectFXAA )
	}

	getInfo = () : WebGLInfo["render"] =>  {
		return ThreeRendererService.enableFXAA ? 
			this.composer.getInfo() : 
			this.renderer.info.render
	}

	onIsWhiteBackgroundChanged(isWhiteBackground: boolean) {
		if (isWhiteBackground) {
			ThreeRendererService.CLEAR_COLOR = ThreeRendererService.BACKGROUND_COLOR.white
		} else {
			ThreeRendererService.CLEAR_COLOR = ThreeRendererService.BACKGROUND_COLOR.normal
		}
		this.renderer.setClearColor(ThreeRendererService.CLEAR_COLOR, ThreeRendererService.CLEAR_ALPHA)
	}

	render() {
		const { scene, camera } = this
		if (ThreeRendererService.enableFXAA) {
			this.composer.render()
		} else {
			this.renderer.render(scene, camera)
		}
	}
}
