import "./threeViewer.module"

import { getService, instantiateModule } from "../../../../../mocks/ng.mockhelper"
import { CustomPanel, ThreeStatsService } from "./threeStatsService"
import { ThreeRendererService } from "./threeRendererService"
import Stats from "three/examples/jsm/libs/stats.module"
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer"
import { WebGLInfo } from "three/src/renderers/webgl/WebGLInfo"
import * as environmentDetector from "../../../util/envDetector"

describe("ThreeStatsService", () => {
	let threeStatsService: ThreeStatsService
	let threeRendererService: ThreeRendererService

	let element: HTMLCanvasElement

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedElement()
		setDevelopmentMode()
	})

	const setDevelopmentMode = () => {
		jest.spyOn(environmentDetector, "isDevelopment").mockReturnValue(true)
	}

	const restartSystem = () => {
		instantiateModule("app.codeCharta.ui.codeMap.threeViewer")

		threeRendererService = getService<ThreeRendererService>("threeRendererService")
	}

	const rebuildService = () => {
		threeStatsService = new ThreeStatsService(threeRendererService)
	}

	const withMockedElement = () => {
		element = { ...element, append: jest.fn() }
	}

	const withMockedStats = () => {
		threeStatsService.stats = {} as Stats
		threeStatsService.stats.addPanel = jest.fn()
		threeStatsService.stats.showPanel = jest.fn()
		threeStatsService.stats.update = jest.fn()
		threeStatsService.stats.domElement = ({
			style: {} as CSSStyleDeclaration,
			remove: jest.fn()
		} as unknown) as HTMLDivElement
	}

	const mockPanels = (keys: string[]) => {
		for (const key of keys) {
			threeStatsService[key] = {}
			threeStatsService[key].panel = {
				update: jest.fn()
			}
		}
	}

	const mockRenderer = () => {
		threeRendererService.renderer = {} as WebGLRenderer
		threeRendererService.renderer.info = { render: {}, memory: {} } as WebGLInfo
	}

	describe("init", () => {
		beforeEach(() => {
			rebuildService()
			mockRenderer()
		})

		it("should call append", () => {
			threeStatsService.init(element)

			expect(element.append).toHaveBeenCalled()
		})

		it("should call generateStatPanels", () => {
			withMockedStats()
			threeStatsService["generateStatPanels"] = jest.fn()
			threeStatsService.init(element)

			expect(threeStatsService["generateStatPanels"]).toHaveBeenCalled()
		})
	})

	describe("generateStatPanels", () => {
		beforeEach(() => {
			rebuildService()
			withMockedStats()
		})

		it("should call addPanel", () => {
			threeStatsService["generateStatPanels"]()

			expect(threeStatsService.stats.addPanel).toHaveBeenCalledTimes(4)
		})

		it("should show stats", () => {
			threeStatsService["generateStatPanels"]()

			expect(threeStatsService.stats.showPanel).toHaveBeenCalled()
		})
	})

	describe("updateStats", () => {
		beforeEach(() => {
			rebuildService()

			mockPanels(["trianglesPanel", "glCallsPanel", "geometryMemoryPanel", "textureMemoryPanel"])
			mockRenderer()
			withMockedStats()
			const ONE_SECOND = 1000
			threeStatsService.prevTime = (performance || Date).now() - ONE_SECOND
		})
		it("should call update panels", () => {
			threeStatsService.updateStats()

			expect(threeStatsService.trianglesPanel.panel.update).toHaveBeenCalled()
			expect(threeStatsService.glCallsPanel.panel.update).toHaveBeenCalled()
		})

		it("should call processPanel", () => {
			threeStatsService["processPanel"] = jest.fn()

			threeStatsService.updateStats()

			expect(threeStatsService["processPanel"]).toHaveBeenCalledTimes(4)
		})

		it("should call update stats", () => {
			threeStatsService.updateStats()

			expect(threeStatsService.stats.update).toHaveBeenCalled()
		})
	})

	describe("resetPanels", () => {
		beforeEach(() => {
			rebuildService()

			mockPanels(["trianglesPanel", "glCallsPanel", "geometryMemoryPanel", "textureMemoryPanel"])
		})

		it("should reset all panels", () => {
			threeStatsService.resetPanels()

			expect(threeStatsService["trianglesPanel"]["maxHeight"]).toBe(0)
			expect(threeStatsService["glCallsPanel"]["maxHeight"]).toBe(0)
			expect(threeStatsService["geometryMemoryPanel"]["maxHeight"]).toBe(0)
			expect(threeStatsService["textureMemoryPanel"]["maxHeight"]).toBe(0)
		})
	})

	describe("processPanel", () => {
		beforeEach(() => {
			rebuildService()
		})
		it("should process panel", () => {
			const customPanel: CustomPanel = {
				panel: {
					update: jest.fn(),
					dom: null
				},
				maxHeight: 0
			}

			threeStatsService["processPanel"](customPanel, 1)

			expect(customPanel.maxHeight).toBe(1)
			expect(customPanel.panel.update).toHaveBeenCalledWith(1, 1.3)
		})
	})

	describe("destroy", () => {
		beforeEach(() => {
			rebuildService()
			withMockedStats()
		})

		it("should remove dom Element", () => {
			threeStatsService.destroy()

			expect(threeStatsService["stats"]["domElement"].remove).toHaveBeenCalled()
		})
	})
})
