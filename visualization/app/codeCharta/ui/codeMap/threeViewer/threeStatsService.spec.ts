import "./threeViewer.module"

import { getService, instantiateModule } from "../../../../../mocks/ng.mockhelper"
import { ThreeStatsService } from "./threeStatsService"
import { ThreeRendererService } from "./threeRendererService"
import Stats from "three/examples/jsm/libs/stats.module"
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer"
import { WebGLInfo } from "three/src/renderers/webgl/WebGLInfo"

describe("ThreeStatsService", () => {
    let threeStatsService: ThreeStatsService
    let threeRendererService: ThreeRendererService

    let element: Element

    beforeEach(() => {
        restartSystem()
        rebuildService()
        withMockedElement()
    })
    
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
        threeStatsService.stats = { 
            addPanel: jest.fn(), 
            showPanel: jest.fn(),
            domElement : {
                style : {} as CSSStyleDeclaration
            } as HTMLDivElement,
            update: jest.fn()
        } as unknown as Stats
    }

    const mockPanels = (keys : string[]) => {
        keys.forEach(key => {
            threeStatsService[key] = {
                update: jest.fn()
            } as unknown as Stats.Panel
        })
    }

    const mockRenderer = () => {
        threeRendererService.renderer = {} as WebGLRenderer
        threeRendererService.renderer.info = { render : {} } as unknown as WebGLInfo
    }
    
    describe("init", () => {
		it("should call appendChild", () => {
            rebuildService()
            mockStats()
            threeStatsService.init(element)

            expect(element.appendChild).toHaveBeenCalled()
            expect(threeStatsService.stats.addPanel).toBeCalledTimes(2)
            expect(threeStatsService.stats.showPanel).toHaveBeenCalled()
		})
    })

    describe("updateStats", () => {
		it("should call update stats", () => {
            rebuildService()

            mockStats()
            threeStatsService.init(element)
            mockPanels(["xPanel","yPanel"])
            mockRenderer()
            threeStatsService.updateStats()

            expect(threeStatsService.xPanel.update).toHaveBeenCalled()
            expect(threeStatsService.yPanel.update).toHaveBeenCalled()
            expect(threeStatsService.stats.update).toHaveBeenCalled()
		})
    })
})