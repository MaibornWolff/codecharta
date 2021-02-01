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
	isDevelopmentMode = isDevelopment()

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
	}

	private generateStatPanels = () => {
		this.trianglesPanel = { panel: this.stats.addPanel(Stats.Panel("triangles", "#ff8", "#221")), maxHeight: 0 }
		this.glCallsPanel = { panel: this.stats.addPanel(Stats.Panel("calls", "#f8f", "#212")), maxHeight: 0 }
		this.stats.showPanel(3)
	}

	updateStats = () => {
		if (this.isDevelopmentMode) {
			const webGLInfo = this.threeRendererService.getInfo()
			this.processPanel(this.trianglesPanel, webGLInfo.triangles)
			this.processPanel(this.glCallsPanel, webGLInfo.calls)
			this.stats.update()
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
