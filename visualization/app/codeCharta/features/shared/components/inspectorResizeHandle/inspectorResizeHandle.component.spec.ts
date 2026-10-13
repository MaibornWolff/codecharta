import { Component } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { INSPECTOR_WIDTH_KEY, InspectorWidthService } from "../../services/inspectorWidth.service"
import { SIDE_PANEL_WIDTH_PX } from "../../util/sidePanelWidth"
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
        await render(InspectorHostComponent)
        jest.spyOn(screen.getByTestId("inspector"), "getBoundingClientRect").mockReturnValue({ right: INSPECTOR_RIGHT_EDGE } as DOMRect)
        return { handle: screen.getByTestId("inspector-resize-handle"), widthService: TestBed.inject(InspectorWidthService) }
    }

    it("should make the inspector as wide as its right edge lies from the dragged handle, and remember the width once it is let go", async () => {
        // Arrange
        const { handle, widthService } = await renderHandle()

        // Act
        handle.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }))
        window.dispatchEvent(new MouseEvent("pointermove", { clientX: 700 }))
        const rememberedWhileDragging = localStorage.getItem(INSPECTOR_WIDTH_KEY)
        window.dispatchEvent(new MouseEvent("pointerup"))

        // Assert
        expect(widthService.width()).toBe(INSPECTOR_RIGHT_EDGE - 700)
        expect(rememberedWhileDragging).toBeNull()
        expect(localStorage.getItem(INSPECTOR_WIDTH_KEY)).toBe(String(INSPECTOR_RIGHT_EDGE - 700))
    })

    it("should put the default width back on a double click", async () => {
        // Arrange
        const { handle, widthService } = await renderHandle()
        widthService.setWidth(500)

        // Act
        handle.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }))

        // Assert
        expect(widthService.width()).toBe(SIDE_PANEL_WIDTH_PX.default)
    })
})
