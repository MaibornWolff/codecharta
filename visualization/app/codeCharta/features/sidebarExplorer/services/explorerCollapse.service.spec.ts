import { TestBed } from "@angular/core/testing"
import { ExplorerCollapseService } from "./explorerCollapse.service"

describe("ExplorerCollapseService", () => {
    let service: ExplorerCollapseService

    beforeEach(() => {
        localStorage.clear()
        TestBed.configureTestingModule({})
        service = TestBed.inject(ExplorerCollapseService)
    })

    it("should default to expanded (isCollapsed false)", () => {
        // Arrange & Act & Assert
        expect(service.isCollapsed()).toBe(false)
    })

    it("should flip isCollapsed to true on toggle()", () => {
        // Arrange & Act
        service.toggle()

        // Assert
        expect(service.isCollapsed()).toBe(true)
    })

    it("should flip isCollapsed back to false on a second toggle()", () => {
        // Arrange
        service.toggle()

        // Act
        service.toggle()

        // Assert
        expect(service.isCollapsed()).toBe(false)
    })

    it("should restore the collapsed state in a later session", () => {
        // Arrange
        service.toggle()

        // Act — a fresh injector stands in for a reload
        TestBed.resetTestingModule()
        TestBed.configureTestingModule({})

        // Assert
        expect(TestBed.inject(ExplorerCollapseService).isCollapsed()).toBe(true)
    })
})
