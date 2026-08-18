import { Injector, runInInjectionContext } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { provideViewScopedExplorerState } from "./provideViewScopedExplorerState"
import { ExplorerCollapseService } from "./services/explorerCollapse.service"
import { ExplorerRevealService } from "./services/explorerReveal.service"
import { ExplorerWidthService } from "./services/explorerWidth.service"

describe("provideViewScopedExplorerState", () => {
    const createViewInjector = (scope: "metrics" | "domain") =>
        Injector.create({ providers: provideViewScopedExplorerState(scope), parent: TestBed.inject(Injector) })

    beforeEach(() => {
        localStorage.clear()
        TestBed.configureTestingModule({})
    })

    it("should give each view its own collapse state, so collapsing one explorer leaves the other open", () => {
        // Arrange
        const metrics = createViewInjector("metrics").get(ExplorerCollapseService)
        const domain = createViewInjector("domain").get(ExplorerCollapseService)

        // Act
        metrics.toggle()

        // Assert
        expect(metrics.isCollapsed()).toBe(true)
        expect(domain.isCollapsed()).toBe(false)
    })

    it("should give each view its own width, so resizing one explorer leaves the other untouched", () => {
        // Arrange
        const metrics = createViewInjector("metrics").get(ExplorerWidthService)
        const domain = createViewInjector("domain").get(ExplorerWidthService)
        const domainWidth = domain.width()

        // Act
        metrics.setWidth(480)

        // Assert
        expect(metrics.width()).toBe(480)
        expect(domain.width()).toBe(domainWidth)
    })

    it("should give each view its own reveal state, so revealing in one explorer does not scroll the other", () => {
        // Arrange
        const metrics = createViewInjector("metrics").get(ExplorerRevealService)
        const domain = createViewInjector("domain").get(ExplorerRevealService)

        // Act
        runInInjectionContext(TestBed.inject(Injector), () => metrics.revealNode("/root/src/main.ts"))

        // Assert
        expect(metrics.revealedNodePath()).toBe("/root/src/main.ts")
        expect(domain.revealedNodePath()).toBe(null)
    })

    it("should persist each view's width under its own key", () => {
        // Arrange
        const metrics = createViewInjector("metrics").get(ExplorerWidthService)

        // Act
        metrics.setWidth(480)

        // Assert
        expect(localStorage.getItem("codeChartaExplorerWidth.metrics")).toBe("480")
        expect(localStorage.getItem("codeChartaExplorerWidth.domain")).toBeNull()
    })

    it("should adopt the width persisted before the per-view split", () => {
        // Arrange
        localStorage.setItem("codeChartaExplorerWidth", "512")

        // Act
        const width = createViewInjector("domain").get(ExplorerWidthService).width()

        // Assert
        expect(width).toBe(512)
    })
})
