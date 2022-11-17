import { CustomPanel, ThreeStatsService } from "./threeStats.service"
import { ThreeRendererService } from "./threeRenderer.service"
import Stats from "three/examples/jsm/libs/stats.module"
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer"
import { WebGLInfo } from "three/src/renderers/webgl/WebGLInfo"
import * as environmentDetector from "../../../util/envDetector"

describe("ThreeStatsService", () => {
	let threeStatsService: ThreeStatsService
	let threeRendererService: ThreeRendererService
	let element: HTMLCanvasElement

	beforeEach(() => {
		setDevelopmentMode(true)
		restartSystem()
	})

	const setDevelopmentMode = (value: boolean) => {
		jest.spyOn(environmentDetector, "isDevelopment").mockReturnValue(value)
	}

	const restartSystem = () => {
		threeRendererService = { getInfo: jest.fn(), getMemoryInfo: jest.fn() } as unknown as ThreeRendererService
		threeRendererService.renderer = {} as WebGLRenderer
		threeRendererService.renderer.info = { render: {}, memory: {} } as WebGLInfo
		threeRendererService.getInfo = jest.fn().mockReturnValue({})
		threeRendererService.getMemoryInfo = jest.fn().mockReturnValue({})

		element = { ...element, append: jest.fn() }

		threeStatsService = new ThreeStatsService(threeRendererService)
		threeStatsService.stats = {} as Stats
		threeStatsService.stats.addPanel = jest.fn()
		threeStatsService.stats.showPanel = jest.fn()
		threeStatsService.stats.update = jest.fn()
		threeStatsService.stats.domElement = {
			style: {} as CSSStyleDeclaration,
			remove: jest.fn()
		} as unknown as HTMLDivElement
	}

	const mockPanels = (keys: string[]) => {
		for (const key of keys) {
			threeStatsService[key] = {}
			threeStatsService[key].panel = {
				update: jest.fn()
			}
		}
	}

	describe("init", () => {
		it("should not do anything when not in development mode", () => {
			setDevelopmentMode(false)
			restartSystem()
			const generateStatPanels = jest.spyOn(threeStatsService, "generateStatPanels" as any)

			threeStatsService.init(element)

			expect(element.append).not.toHaveBeenCalled()
			expect(generateStatPanels).not.toHaveBeenCalled()
		})

		it("should append element when in development mode", () => {
			threeStatsService.init(element)

			expect(element.append).toHaveBeenCalled()
		})

		it("should call generateStatPanels", () => {
			const generateStatPanels = jest.spyOn(threeStatsService, "generateStatPanels" as any)

			threeStatsService.init(element)

			expect(generateStatPanels).toHaveBeenCalled()
		})
	})

	describe("generateStatPanels", () => {
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
		const ONE_SECOND = 1000

		beforeEach(() => {
			const getTimeFunctor = (jest.spyOn(threeStatsService, "getTimeFunctor" as any) as unknown as CallableFunction)()

			mockPanels(["trianglesPanel", "glCallsPanel", "geometryMemoryPanel", "textureMemoryPanel"])

			threeStatsService.prevTime = getTimeFunctor.now() - ONE_SECOND
		})

		it("should not do anything when not in development mode", () => {
			setDevelopmentMode(false)
			restartSystem()
			const processPanel = jest.spyOn(threeStatsService, "processPanel" as any)

			threeStatsService.updateStats()

			expect(processPanel).not.toHaveBeenCalled()
		})

		it("should call processPanel when time difference is more then one second", () => {
			const processPanel = jest.spyOn(threeStatsService, "processPanel" as any)

			threeStatsService.updateStats()

			expect(processPanel).toHaveBeenCalledTimes(4)
		})

		it("should not call processPanel when time difference is less then one second", () => {
			const getTimeFunctor = (jest.spyOn(threeStatsService, "getTimeFunctor" as any) as unknown as CallableFunction)()
			threeStatsService.prevTime = getTimeFunctor.now()

			const processPanel = jest.spyOn(threeStatsService, "processPanel" as any)

			threeStatsService.updateStats()

			expect(processPanel).not.toHaveBeenCalled()
		})

		it("should call stats update", () => {
			threeStatsService.updateStats()

			expect(threeStatsService.stats.update).toHaveBeenCalled()
		})
	})

	describe("resetPanels", () => {
		beforeEach(() => {
			mockPanels(["trianglesPanel", "glCallsPanel", "geometryMemoryPanel", "textureMemoryPanel"])
		})

		it("should not do anything when not in development mode", () => {
			setDevelopmentMode(false)
			restartSystem()

			threeStatsService.resetPanels()

			expect(threeStatsService.trianglesPanel).toBe(undefined)
			expect(threeStatsService.glCallsPanel).toBe(undefined)
			expect(threeStatsService.geometryMemoryPanel).toBe(undefined)
			expect(threeStatsService.textureMemoryPanel).toBe(undefined)
		})

		it("should reset all panels", () => {
			threeStatsService.resetPanels()

			expect(threeStatsService.trianglesPanel.maxHeight).toBe(0)
			expect(threeStatsService.glCallsPanel.maxHeight).toBe(0)
			expect(threeStatsService.geometryMemoryPanel.maxHeight).toBe(0)
			expect(threeStatsService.textureMemoryPanel.maxHeight).toBe(0)
		})
	})

	describe("processPanel", () => {
		const mockCustomPanel = (): CustomPanel => {
			return {
				panel: {
					update: jest.fn(),
					dom: null
				},
				maxHeight: 0
			}
		}
		it("should process panel", () => {
			const customPanel = mockCustomPanel()

			threeStatsService["processPanel"](customPanel, 1)

			expect(customPanel.maxHeight).toBe(1)
			expect(customPanel.panel.update).toHaveBeenCalledWith(1, 1.3)
		})
	})

	describe("destroy", () => {
		it("should not do anything when not in development mode", () => {
			setDevelopmentMode(false)
			restartSystem()

			threeStatsService.destroy()

			expect(threeStatsService.stats.domElement.remove).not.toHaveBeenCalled()
		})

		it("should remove dom Element", () => {
			threeStatsService.destroy()

			expect(threeStatsService.stats.domElement.remove).toHaveBeenCalled()
		})
	})
})
