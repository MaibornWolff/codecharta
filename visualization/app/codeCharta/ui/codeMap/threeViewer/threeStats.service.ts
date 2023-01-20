import Stats from "three/examples/jsm/libs/stats.module"
import { ThreeRendererService } from "./threeRenderer.service"
import { Inject, Injectable, isDevMode } from "@angular/core"

const ONE_SECOND = 1000
export interface CustomPanel {
	panel: Stats.Panel
	maxHeight: number
}

@Injectable({ providedIn: "root" })
export class ThreeStatsService {
	stats: Stats
	trianglesPanel: CustomPanel
	glCallsPanel: CustomPanel
	geometryMemoryPanel: CustomPanel
	textureMemoryPanel: CustomPanel
	prevTime: number
	isDevelopmentMode = isDevMode()

	constructor(@Inject(ThreeRendererService) private threeRendererService: ThreeRendererService) {}

	init = (canvasElement: Element) => {
		if (this.isDevelopmentMode) {
			this.stats = Stats()

			this.stats.domElement.style.position = "absolute"
			this.stats.domElement.style.left = "0"
			this.stats.domElement.style.top = "0"

			canvasElement.append(this.stats.dom)

			this.generateStatPanels()

			this.prevTime = this.getTimeFunctor().now()
		}
	}

	private getTimeFunctor = () => {
		return typeof performance === "undefined" ? Date : performance
	}

	private generateStatPanels = () => {
		this.trianglesPanel = { panel: this.stats.addPanel(Stats.Panel("triangles", "#ff8", "#221")), maxHeight: 0 }
		this.glCallsPanel = { panel: this.stats.addPanel(Stats.Panel("calls", "#f8f", "#212")), maxHeight: 0 }
		this.geometryMemoryPanel = { panel: this.stats.addPanel(Stats.Panel("geo. mem", "#f08", "#221")), maxHeight: 0 }
		this.textureMemoryPanel = { panel: this.stats.addPanel(Stats.Panel("tex. mem", "#0f8", "#221")), maxHeight: 0 }

		this.stats.showPanel(3)
	}

	updateStats = () => {
		if (this.isDevelopmentMode) {
			const time = this.getTimeFunctor().now()
			if (time >= this.prevTime + ONE_SECOND) {
				this.prevTime = time
				const webGLInfo = this.threeRendererService.getInfo()
				const threeJsInfo = this.threeRendererService.getMemoryInfo()
				this.processPanel(this.trianglesPanel, webGLInfo.triangles)
				this.processPanel(this.glCallsPanel, webGLInfo.calls)
				this.processPanel(this.geometryMemoryPanel, threeJsInfo.geometries)
				this.processPanel(this.textureMemoryPanel, threeJsInfo.textures)
			}
			this.stats.update()
		}
	}

	resetPanels = () => {
		if (this.isDevelopmentMode) {
			for (const panel of [this.trianglesPanel, this.glCallsPanel, this.geometryMemoryPanel, this.textureMemoryPanel]) {
				if (panel !== undefined) {
					panel.maxHeight = 0
				}
			}
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
