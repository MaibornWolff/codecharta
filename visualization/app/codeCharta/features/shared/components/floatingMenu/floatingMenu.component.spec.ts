import { Component, signal } from "@angular/core"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { FloatingMenuAnchor, FloatingMenuComponent } from "./floatingMenu.component"

@Component({
    selector: "cc-floating-menu-host",
    imports: [FloatingMenuComponent],
    template: `
        @if (anchor(); as anchor) {
            <cc-floating-menu data-testid="menu" [anchor]="anchor" (dismissed)="dismissed()">
                <button type="button">Inside</button>
            </cc-floating-menu>
        }
    `
})
class FloatingMenuHostComponent {
    readonly anchor = signal<FloatingMenuAnchor | null>({ x: 40, y: 80 })
    readonly dismissed = jest.fn()
}

describe("FloatingMenuComponent", () => {
    async function setup() {
        const renderResult = await render(FloatingMenuHostComponent)
        return { ...renderResult, host: renderResult.fixture.componentInstance }
    }

    it("should open at the anchor before it was measured", async () => {
        // Arrange & Act
        await setup()

        // Assert
        const menu = screen.getByTestId("menu")
        expect(menu.style.left).toBe("40px")
        expect(menu.style.top).toBe("80px")
    })

    it("should stay hidden until it was measured, so it never flashes at an unclamped position", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByTestId("menu").style.visibility).toBe("hidden")
    })

    it("should dismiss on a click outside", async () => {
        // Arrange
        const { host } = await setup()

        // Act
        await userEvent.click(document.body)

        // Assert
        expect(host.dismissed).toHaveBeenCalled()
    })

    it("should stay open on a click inside", async () => {
        // Arrange
        const { host } = await setup()

        // Act
        await userEvent.click(screen.getByText("Inside"))

        // Assert
        expect(host.dismissed).not.toHaveBeenCalled()
    })

    it("should dismiss when the window is resized, as the anchor is then stale", async () => {
        // Arrange
        const { host } = await setup()

        // Act
        window.dispatchEvent(new Event("resize"))

        // Assert
        expect(host.dismissed).toHaveBeenCalled()
    })

    it("should suppress the browser menu on a right-click inside", async () => {
        // Arrange
        await setup()
        const contextMenuEvent = new MouseEvent("contextmenu", { bubbles: true, cancelable: true })

        // Act
        screen.getByTestId("menu").dispatchEvent(contextMenuEvent)

        // Assert
        expect(contextMenuEvent.defaultPrevented).toBe(true)
    })
})
