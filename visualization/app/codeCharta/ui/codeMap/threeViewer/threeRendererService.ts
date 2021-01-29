import { Camera, Scene, WebGLRenderer } from "three"
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
export class ThreeRendererService implements IsWhiteBackgroundSubscriber {
	
	static BACKGROUND_COLOR = {
		white: 0xffffff,
		normal: 0xeeeedd
	}

	static CLEAR_COLOR = ThreeRendererService.BACKGROUND_COLOR.normal

	static CLEAR_ALPHA = 1

	static RENDER_OPTIONS = {
		antialias: window.devicePixelRatio > 1.7 ? false : true,
									// 1.7 is just a guess number			
									// on deactivated pixel ratio>1.7 improves quality, 
									// performance hit is huge especially on fill rate limited gpus 
									// better to use fxaa and composing when device ratio is high
		preserveDrawingBuffer: true
	}

	composer: CustomComposer
	renderer: WebGLRenderer
	scene : Scene
	camera: Camera
	enableFXAA = false

	constructor(private storeService: StoreService, private $rootScope: IRootScopeService) {
		IsWhiteBackgroundService.subscribe(this.$rootScope, this)
	}

	init(containerWidth: number, containerHeight: number,scene : Scene, camera: Camera) {
		// eslint-disable-next-line no-console
		console.log("init")
		this.scene = scene
		this.camera = camera
		this.renderer = new WebGLRenderer(ThreeRendererService.RENDER_OPTIONS)
		this.renderer.setPixelRatio(window.devicePixelRatio)
		this.composer = new CustomComposer( this.renderer );
		this.renderer.setSize(containerWidth, containerHeight)
		this.onIsWhiteBackgroundChanged(this.storeService.getState().appSettings.isWhiteBackground)
		if (!ThreeRendererService.RENDER_OPTIONS.antialias) {
			this.enableFXAA = true
			this.initComposer()
		}
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
		if (this.enableFXAA) {
			this.composer.render()
		} else {
			this.renderer.render(scene, camera)
		}
	}
}
