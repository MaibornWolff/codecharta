import { signal } from "@angular/core"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { EXPLORER_FOCUS } from "../../explorerFocus.port"
import { ExplorerFocusBannerComponent } from "./explorerFocusBanner.component"

describe("ExplorerFocusBannerComponent", () => {
    const unfocus = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    function setup(isFocused: boolean) {
        return render(ExplorerFocusBannerComponent, {
            providers: [{ provide: EXPLORER_FOCUS, useValue: { isFocused: signal(isFocused), unfocus } }]
        })
    }

    it("should say that the explorer is cut down to a focus, and how to get the whole project back", async () => {
        // Arrange & Act
        await setup(true)

        // Assert
        const banner = screen.getByTestId("explorer-focus-banner")
        expect(banner.textContent).toContain("Focus mode")
        expect(banner.textContent).toContain("Show whole project")
    })

    it("should leave the focus when the banner is clicked", async () => {
        // Arrange
        await setup(true)

        // Act
        await userEvent.click(screen.getByTestId("explorer-focus-banner"))

        // Assert
        expect(unfocus).toHaveBeenCalledTimes(1)
    })

    it("should stay away while nothing is focused", async () => {
        // Arrange & Act
        await setup(false)

        // Assert
        expect(screen.queryByTestId("explorer-focus-banner")).toBeNull()
    })

    it("should stay away in a view that has no focus", async () => {
        // Arrange & Act
        await render(ExplorerFocusBannerComponent)

        // Assert
        expect(screen.queryByTestId("explorer-focus-banner")).toBeNull()
    })
})
