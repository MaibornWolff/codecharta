import { TestBed } from "@angular/core/testing"
import { ExplorerCollapseService } from "./explorerCollapse.service"

describe("ExplorerCollapseService", () => {
    let service: ExplorerCollapseService

    beforeEach(() => {
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
})
