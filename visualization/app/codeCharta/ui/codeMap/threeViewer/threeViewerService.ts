"use strict"

import * as Stats from "stats-js"	// NOTE npm i stats-js
import { ThreeSceneService } from "./threeSceneService"
import { ThreeCameraService } from "./threeCameraService"
import { ThreeOrbitControlsService } from "./threeOrbitControlsService"
import { ThreeRendererService } from "./threeRendererService"
import { ThreeUpdateCycleService } from "./threeUpdateCycleService"
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { fxaaShaderStrings } from '../rendering/fxaaShaderString'
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass"
import { WebGLInfo } from "three"

export class ThreeViewerService {
	private stats : Stats
	private xPanel
	private yPanel
	private maxXPanel = 0
	private maxYPanel = 0
	private enableFXAA = false // TODO can be selective

	/* ngInject */
	constructor(
		private threeSceneService: ThreeSceneService,
		private threeCameraService: ThreeCameraService,
		private threeOrbitControlsService: ThreeOrbitControlsService,
		private threeRendererService: ThreeRendererService,
		private threeUpdateCycleService: ThreeUpdateCycleService
	) {
		this.stats = new Stats()	// TODO needs to be injected only for test purpose 
		
		/* 	NOTE FXAA instead of aliasing shader set to medium quality,
			could try out different filtering techniques */
		if (!ThreeRendererService.RENDER_OPTIONS.antialias) {
			this.enableFXAA = true
		}							
	}

	init(canvasElement: Element) {
		this.initStats(canvasElement)
		this.threeCameraService.init(window.innerWidth, window.innerHeight)
		this.threeCameraService.camera.lookAt(this.threeSceneService.scene.position)
		this.threeSceneService.scene.add(this.threeCameraService.camera)
		this.threeRendererService.init(window.innerWidth, window.innerHeight)
		this.threeOrbitControlsService.init(this.threeRendererService.renderer.domElement)
		this.threeRendererService.renderer.setPixelRatio(window.devicePixelRatio)  // TODO needs ui progressbar (from 1 to window.devicePixelRatio)
		
		if (this.enableFXAA) {
			this.initComposer()
		}

		canvasElement.appendChild(this.threeRendererService.renderer.domElement)

		window.addEventListener("resize", () => this.onWindowResize())
		window.addEventListener("focusin", event => this.onFocusIn(event))
		window.addEventListener("focusout", event => this.onFocusOut(event))
	}

	initStats = (canvasElement: Element) => {
		// TODO refactoring is needed
		const { stats } = this
		this.xPanel = stats.addPanel( new Stats.Panel( 'triangles', '#ff8', '#221' ) )
		this.yPanel = stats.addPanel( new Stats.Panel( 'calls', '#f8f', '#212' ) )
		stats.showPanel( 3 )

		stats.domElement.style.position = 'absolute'
		stats.domElement.style.left = '0'
		stats.domElement.style.top = '0'
		canvasElement.appendChild( stats.dom )
	}

	private updateStats = () => {
		const webGLInfo : WebGLInfo["render"]= this.enableFXAA ? 
			this.threeRendererService.composer.getInfo() : 
			this.threeRendererService.renderer.info.render
		
		const triangles : number = webGLInfo.triangles
		this.maxXPanel = Math.max(this.maxXPanel,triangles)
		this.xPanel.update( triangles, this.maxXPanel*1.3 )

		const calls : number = webGLInfo.calls
		this.maxYPanel = Math.max(this.maxYPanel,calls)
		this.yPanel.update( calls, this.maxYPanel*1.3 )

		this.stats.update()
	}

	// TODO render pass needs to be injected
	private initComposer = () => { 
		const pixelRatio = this.threeRendererService.renderer.getPixelRatio()

		this.threeRendererService.composer.setSize( window.innerWidth* pixelRatio, window.innerHeight* pixelRatio)
		const renderPass = new RenderPass( this.threeSceneService.scene, this.threeCameraService.camera )
		this.threeRendererService.composer.addPass( renderPass )
		
		const effectFXAA = new ShaderPass( new fxaaShaderStrings() )
		effectFXAA.renderToScreen = false
        effectFXAA.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth* pixelRatio ) 
		effectFXAA.uniforms[ 'resolution' ].value.y = 1 / ( window.innerHeight* pixelRatio )
        this.threeRendererService.composer.addPass( effectFXAA )
	}

	onWindowResize() {
		this.threeSceneService.scene.updateMatrixWorld(false)
		this.threeRendererService.renderer.setSize(window.innerWidth, window.innerHeight)
		this.threeCameraService.camera.aspect = window.innerWidth / window.innerHeight
		this.threeCameraService.camera.updateProjectionMatrix()
	}

	onFocusIn(event) {
		if (event.target.nodeName === "INPUT") {
			this.threeOrbitControlsService.controls.enableKeys = false
		}
	}

	onFocusOut(event) {
		if (event.target.nodeName === "INPUT") {
			this.threeOrbitControlsService.controls.enableKeys = true
		}
	}

	private render() {
		if (this.enableFXAA) {
			this.threeRendererService.composer.render()
		} else {
			this.threeRendererService.renderer.render(this.threeSceneService.scene, this.threeCameraService.camera)
		}
	}

	dispose() {
		this.threeRendererService?.composer?.dispose()
	}

	animate() {
		requestAnimationFrame(() => this.animate())
		this.render()
		this.threeOrbitControlsService.controls.update()
		this.threeUpdateCycleService.update()
		this.updateStats()
	}
}
