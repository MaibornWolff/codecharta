import { TestBed } from "@angular/core/testing"
import { ExplorerCollapseService } from "./explorerCollapse.service"
import { ExplorerRevealService } from "./explorerReveal.service"

describe("ExplorerRevealService", () => {
    let revealService: ExplorerRevealService
    let collapseService: ExplorerCollapseService

    beforeEach(() => {
        jest.useFakeTimers()
        revealService = TestBed.inject(ExplorerRevealService)
        collapseService = TestBed.inject(ExplorerCollapseService)
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it("should expand a collapsed explorer when revealing a node", () => {
        // Arrange
        collapseService.isCollapsed.set(true)

        // Act
        revealService.revealNode("/root/some/node")

        // Assert
        expect(collapseService.isCollapsed()).toBe(false)
    })

    it("should expose the revealed node path and clear it after the highlight duration", () => {
        // Arrange & Act
        revealService.revealNode("/root/some/node")

        // Assert
        expect(revealService.revealedNodePath()).toBe("/root/some/node")

        // Act
        jest.runAllTimers()

        // Assert
        expect(revealService.revealedNodePath()).toBe(null)
    })

    it("should keep the latest path when revealing twice in a row", () => {
        // Arrange
        revealService.revealNode("/root/first")

        // Act
        revealService.revealNode("/root/second")

        // Assert
        expect(revealService.revealedNodePath()).toBe("/root/second")
    })
})
