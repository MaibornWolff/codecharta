import { Component, signal } from "@angular/core"
import { fireEvent, render, screen } from "@testing-library/angular"
import { ColumnResizeHandleDirective, ResizedEdge } from "./columnResizeHandle.directive"

const PANEL = { left: 100, right: 500, width: 400 } as DOMRect

@Component({
    template: `
        <aside data-testid="panel">
            @if (hasHandle()) {
                <div
                    data-testid="handle"
                    [ccColumnResizeHandle]="edge()"
                    (widthChange)="widths.push($event)"
                    (resizeEnd)="ends.push('end')"
                    (widthReset)="resets.push('reset')"
                ></div>
            }
        </aside>
    `,
    imports: [ColumnResizeHandleDirective]
})
class PanelHostComponent {
    readonly edge = signal<ResizedEdge>("right")
    readonly hasHandle = signal(true)
    readonly widths: number[] = []
    readonly ends: string[] = []
    readonly resets: string[] = []
}

describe("ColumnResizeHandleDirective", () => {
    async function renderPanel(edge: ResizedEdge) {
        const { fixture } = await render(PanelHostComponent)
        fixture.componentInstance.edge.set(edge)
        fixture.detectChanges()
        jest.spyOn(screen.getByTestId("panel"), "getBoundingClientRect").mockReturnValue(PANEL)
        return { fixture, host: fixture.componentInstance, handle: screen.getByTestId("handle") }
    }

    const dragTo = (handle: HTMLElement, clientX: number) => {
        handle.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }))
        window.dispatchEvent(new MouseEvent("pointermove", { clientX }))
    }

    it.each<[ResizedEdge, number]>([
        ["right", 250],
        ["left", 150]
    ])("should ask for the width that puts the %s edge of its panel under the pointer", async (edge, expectedWidth) => {
        // Arrange
        const { host, handle } = await renderPanel(edge)

        // Act
        dragTo(handle, 350)

        // Assert
        expect(host.widths).toEqual([expectedWidth])
        expect(handle.classList.contains(`${edge}-0`)).toBe(true)
    })

    it("should tell the end of a drag once, and ask for nothing while the pointer moves without one", async () => {
        // Arrange
        const { host, handle } = await renderPanel("right")
        window.dispatchEvent(new MouseEvent("pointermove", { clientX: 300 }))
        dragTo(handle, 650)

        // Act
        window.dispatchEvent(new MouseEvent("pointerup"))
        window.dispatchEvent(new MouseEvent("pointerup"))
        window.dispatchEvent(new MouseEvent("pointermove", { clientX: 900 }))

        // Assert
        expect(host.widths).toEqual([550])
        expect(host.ends).toEqual(["end"])
        expect(document.body.style.userSelect).toBe("")
    })

    it("should end a drag when the handle is gone", async () => {
        // Arrange
        const { fixture, host, handle } = await renderPanel("right")
        dragTo(handle, 650)

        // Act
        host.hasHandle.set(false)
        fixture.detectChanges()
        window.dispatchEvent(new MouseEvent("pointermove", { clientX: 900 }))

        // Assert
        expect(host.widths).toEqual([550])
        expect(document.body.style.userSelect).toBe("")
    })

    it.each<[ResizedEdge, string, number]>([
        ["right", "ArrowRight", 416],
        ["right", "ArrowLeft", 384],
        ["left", "ArrowLeft", 416],
        ["left", "ArrowRight", 384]
    ])("should move the %s edge a step with %s, for those who resize from the keyboard", async (edge, key, expectedWidth) => {
        // Arrange
        const { host, handle } = await renderPanel(edge)

        // Act
        fireEvent.keyDown(handle, { key })

        // Assert
        expect(host.widths).toEqual([expectedWidth])
        expect(host.ends).toEqual(["end"])
        expect(handle.getAttribute("role")).toBe("separator")
        expect(handle.getAttribute("tabindex")).toBe("0")
    })

    it("should ask for the reset of the width on a double click", async () => {
        // Arrange
        const { host, handle } = await renderPanel("left")

        // Act
        fireEvent.dblClick(handle)

        // Assert
        expect(host.resets).toEqual(["reset"])
    })
})
