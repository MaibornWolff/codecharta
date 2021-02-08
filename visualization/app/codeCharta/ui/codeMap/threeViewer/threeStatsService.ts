import Stats from "three/examples/jsm/libs/stats.module"
import { ThreeRendererService } from "./threeRendererService"
import { isDevelopment } from "../../../util/envDetector"
export interface CustomPanel {
	panel: Stats.Panel
	maxHeight: number
}
export class ThreeStatsService {
	stats: Stats
	trianglesPanel: CustomPanel
	glCallsPanel: CustomPanel
	geometryMemory: CustomPanel
	textureMemory: CustomPanel
	prevTime : number
	isDevelopmentMode = isDevelopment()

	private static ONE_SECOND = 1000

	/* ngInject */
	constructor(private threeRendererService: ThreeRendererService) {}

	init = (canvasElement: Element) => {
		if (this.isDevelopmentMode) {
			this.stats = Stats()

			this.stats.domElement.style.position = "absolute"
			this.stats.domElement.style.left = "0"
			this.stats.domElement.style.top = "0"
			canvasElement.appendChild(this.stats.dom)

			this.generateStatPanels()
		}

		this.prevTime = ( performance || Date ).now()
	}

	private generateStatPanels = () => {
		this.trianglesPanel = { panel: this.stats.addPanel(Stats.Panel("triangles", "#ff8", "#221")), maxHeight: 0 }
		this.glCallsPanel = { panel: this.stats.addPanel(Stats.Panel("calls", "#f8f", "#212")), maxHeight: 0 }
		this.geometryMemory = { panel: this.stats.addPanel(Stats.Panel("geo. mem", "#f08", "#221")), maxHeight: 0 }
		this.textureMemory= { panel: this.stats.addPanel(Stats.Panel("tex. mem", "#0f8", "#221")), maxHeight: 0 }
		
		this.stats.showPanel(0)
	}

	updateStats = () => {
		if (this.isDevelopmentMode) {
			const time = ( performance || Date ).now()
			if ( time >= this.prevTime + ThreeStatsService.ONE_SECOND ) {
				this.prevTime = time;
				const webGLRenderInfo = this.threeRendererService.getRenderInfo()
				const threeJsInfo = this.threeRendererService.getMemoryInfo()
				this.processPanel(this.trianglesPanel, webGLRenderInfo.triangles)
				this.processPanel(this.glCallsPanel, webGLRenderInfo.calls)
				this.processPanel(this.geometryMemory, threeJsInfo.geometries)
				this.processPanel(this.textureMemory, threeJsInfo.textures)
			}
			this.stats.update()
		}
	}

	resetPanels = () => {
		if (this.isDevelopmentMode) {
			[this.trianglesPanel,this.glCallsPanel,this.geometryMemory,this.textureMemory].forEach(panel => {
				if (panel!==undefined)
					panel.maxHeight = 0
			})
		}
	}

	private processPanel = (customPanel: CustomPanel, value: number) => {
		customPanel.maxHeight = Math.max(customPanel.maxHeight, value)
		customPanel.panel.update(value, customPanel.maxHeight * 1.3)
	}

	destroy = () => {
		if (this.isDevelopmentMode) {
			this.stats.domElement.remove()
		}
	}
}
