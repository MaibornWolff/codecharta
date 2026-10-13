import { Component } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { INSPECTOR_DEFAULT_WIDTH, InspectorWidthService } from "../../services/inspectorWidth.service"
import { InspectorResizeHandleComponent } from "./inspectorResizeHandle.component"

const INSPECTOR_RIGHT_EDGE = 1200

@Component({
    template: `<aside data-testid="inspector"><cc-inspector-resize-handle></cc-inspector-resize-handle></aside>`,
    imports: [InspectorResizeHandleComponent]
})
class InspectorHostComponent {}

describe("InspectorResizeHandleComponent", () => {
    async function renderHandle() {
        localStorage.clear()
        const rendered = await render(InspectorHostComponent)
        jest.spyOn(screen.getByTestId("inspector"), "getBoundingClientRect").mockReturnValue({ right: INSPECTOR_RIGHT_EDGE } as DOMRect)
        return { ...rendered, handle: screen.getByTestId("inspector-resize-handle"), widthService: TestBed.inject(InspectorWidthService) }
    }

    it("should make the inspector as wide as its right edge lies from the dragged handle", async () => {
        // Arrange
        const { handle, widthService } = await renderHandle()

        // Act
        handle.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }))
        window.dispatchEvent(new MouseEvent("pointermove", { clientX: 700 }))
        window.dispatchEvent(new MouseEvent("pointerup"))

        // Assert
        expect(widthService.width()).toBe(INSPECTOR_RIGHT_EDGE - 700)
    })

    it("should stop resizing once the pointer is released or the handle is gone", async () => {
        // Arrange
        const { handle, widthService, fixture } = await renderHandle()
        handle.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }))
        window.dispatchEvent(new MouseEvent("pointermove", { clientX: 700 }))
        window.dispatchEvent(new MouseEvent("pointerup"))

        // Act
        window.dispatchEvent(new MouseEvent("pointermove", { clientX: 600 }))
        handle.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }))
        fixture.destroy()
        window.dispatchEvent(new MouseEvent("pointermove", { clientX: 600 }))

        // Assert
        expect(widthService.width()).toBe(INSPECTOR_RIGHT_EDGE - 700)
        expect(document.body.style.userSelect).toBe("")
    })

    it("should leave the width alone while the pointer moves without a drag", async () => {
        // Arrange
        const { widthService } = await renderHandle()

        // Act
        window.dispatchEvent(new MouseEvent("pointermove", { clientX: 700 }))

        // Assert
        expect(widthService.width()).toBe(INSPECTOR_DEFAULT_WIDTH)
    })

    it("should put the default width back on a double click", async () => {
        // Arrange
        const { handle, widthService } = await renderHandle()
        widthService.setWidth(500)

        // Act
        handle.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }))

        // Assert
        expect(widthService.width()).toBe(INSPECTOR_DEFAULT_WIDTH)
    })
})
