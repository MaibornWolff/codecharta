import "./threeViewer.module"

import { getService, instantiateModule } from "../../../../../mocks/ng.mockhelper"
import { CustomPanel, ThreeStatsService } from "./threeStatsService"
import { ThreeRendererService } from "./threeRendererService"
import Stats from "three/examples/jsm/libs/stats.module"
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer"
import { WebGLInfo } from "three/src/renderers/webgl/WebGLInfo"
import *  as environmentDetector from "../../../util/envDetector"

describe("ThreeStatsService", () => {
	let threeStatsService: ThreeStatsService
	let threeRendererService: ThreeRendererService

	let element: Element

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedElement()
		setDevelopmentMode()
	})

	const setDevelopmentMode = () => {
		jest.spyOn(environmentDetector,"isDevelopment").mockReturnValue(true)
	}
	
	const restartSystem = () => {
		instantiateModule("app.codeCharta.ui.codeMap.threeViewer")

		threeRendererService = getService<ThreeRendererService>("threeRendererService")	
	}

	const rebuildService = () => {
		threeStatsService = new ThreeStatsService(threeRendererService)
	}

	const withMockedElement = () => {
		element = { appendChild: jest.fn() } as unknown as Element
	}

	const mockStats = () => {
		threeStatsService.stats = { } as Stats
		threeStatsService.stats.addPanel = jest.fn()
		threeStatsService.stats.showPanel = jest.fn()
		threeStatsService.stats.update = jest.fn()
		threeStatsService.stats.domElement = {
			style : {} as CSSStyleDeclaration
		} as HTMLDivElement
	}

	const mockPanels = (keys : string[]) => {
		keys.forEach(key => {
			threeStatsService[key] = {}
			threeStatsService[key].panel = {
				update: jest.fn()
			} as unknown as Stats.Panel
		})
	}

	const mockRenderer = () => {
		threeRendererService.renderer = {} as WebGLRenderer
		threeRendererService.renderer.info = { render : {} } as unknown as WebGLInfo
	}
	
	describe("init", () => {
		beforeEach(() => {
			rebuildService()
			mockRenderer()
		})

		it("should call appendChild", () => {
			threeStatsService.init(element)

			expect(element.appendChild).toHaveBeenCalled()
		})

		it("should call generateStatPanels", () => {
			mockStats()
			threeStatsService["generateStatPanels"] = jest.fn()
			threeStatsService.init(element)
			
			expect(threeStatsService["generateStatPanels"]).toHaveBeenCalled()
		})
	})

	describe("generateStatPanels", () => {
		beforeEach(() => {
			rebuildService()
			mockStats()
		})

		it("should call addPanel", () => {
			threeStatsService["generateStatPanels"]()
			
			expect(threeStatsService.stats.addPanel).toHaveBeenCalledTimes(2)
		})

		it("should show stats", () => {
			threeStatsService["generateStatPanels"]()
			
			expect(threeStatsService.stats.showPanel).toHaveBeenCalled()
		})
	})

	describe("updateStats", () => {
		beforeEach(() => {
			rebuildService()

			mockPanels(["trianglesPanel","glCallsPanel"])
			mockRenderer()
			mockStats()
		})
		it("should call update panels", () => {
			threeStatsService.updateStats()
			
			expect(threeStatsService.trianglesPanel.panel.update).toHaveBeenCalled()
			expect(threeStatsService.glCallsPanel.panel.update).toHaveBeenCalled()
		})
		
		it("should call processPanel", () => {
			threeStatsService["processPanel"] = jest.fn()
			threeStatsService.updateStats()
			
			expect(threeStatsService["processPanel"]).toHaveBeenCalledTimes(2)
		})
		
		it("should call update stats", () => {
			threeStatsService.updateStats()
		
			expect(threeStatsService.stats.update).toHaveBeenCalled()
		})
	})

	describe("processPanel", () => {
		beforeEach(() => {
			rebuildService()
		})
		it("should process panel", () => {
			const customPanel = {
				panel: {
					update : jest.fn()
				},
				maxHeight: 0
			} as unknown as CustomPanel
	
			threeStatsService["processPanel"](customPanel,1)
	
			expect(customPanel.maxHeight).toBe(1)
			expect(customPanel.panel.update).toHaveBeenCalledWith(1,1.3)
		})
	})
})