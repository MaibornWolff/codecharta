import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { ExtensionRulesService } from "../../services/extensionRules.service"
import { contextMenuPositionAt, FileExtensionContextMenuComponent } from "./fileExtensionContextMenu.component"

describe("FileExtensionContextMenuComponent", () => {
    const extensionRulesService = {
        getIsFlattenedByFileExtension: jest.fn(),
        flatten: jest.fn(),
        exclude: jest.fn(),
        show: jest.fn()
    }

    async function renderMenu() {
        const closed = jest.fn()
        await render(FileExtensionContextMenuComponent, {
            inputs: { fileExtension: "ts", position: { left: 10, bottom: 20 } },
            on: { closed },
            providers: [provideMockStore(), { provide: ExtensionRulesService, useValue: extensionRulesService }]
        })
        return closed
    }

    beforeEach(() => {
        extensionRulesService.getIsFlattenedByFileExtension.mockReturnValue(of(false))
    })

    afterEach(() => {
        jest.clearAllMocks()
        TestBed.resetTestingModule()
    })

    it("should close when the pointer goes down outside the menu", async () => {
        // Arrange
        const closed = await renderMenu()

        // Act
        document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }))

        // Assert
        expect(closed).toHaveBeenCalled()
    })

    it("should stay open when the pointer goes down inside the menu", async () => {
        // Arrange
        const closed = await renderMenu()

        // Act
        screen.getByText("Exclude").dispatchEvent(new Event("pointerdown", { bubbles: true }))

        // Assert
        expect(closed).not.toHaveBeenCalled()
    })

    it("should close when the page scrolls with the wheel", async () => {
        // Arrange
        const closed = await renderMenu()

        // Act
        document.dispatchEvent(new Event("wheel"))

        // Assert
        expect(closed).toHaveBeenCalled()
    })

    it("should exclude its extension and close when clicking exclude", async () => {
        // Arrange
        const closed = await renderMenu()

        // Act
        screen.getByText("Exclude").click()

        // Assert
        expect(extensionRulesService.exclude).toHaveBeenCalledWith("ts")
        expect(closed).toHaveBeenCalled()
    })

    it("should keep the menu inside the viewport near the right edge", () => {
        // Arrange
        const event = new MouseEvent("contextmenu", { clientX: window.innerWidth, clientY: 100 })

        // Act
        const position = contextMenuPositionAt(event)

        // Assert
        expect(position).toEqual({ left: window.innerWidth - 192 - 4, bottom: window.innerHeight - 100 })
    })
})
