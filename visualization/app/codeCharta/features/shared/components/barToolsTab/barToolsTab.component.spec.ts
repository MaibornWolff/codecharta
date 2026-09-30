import { render, screen } from "@testing-library/angular"
import { BarToolsTabComponent } from "./barToolsTab.component"

describe("BarToolsTabComponent", () => {
    it("should group the tools it is given into one toolbar", async () => {
        // Act
        await render('<cc-bar-tools-tab><button type="button">Screenshot</button></cc-bar-tools-tab>', {
            imports: [BarToolsTabComponent]
        })

        // Assert
        const toolbar = screen.getByRole("toolbar", { name: "View tools" })
        expect(toolbar.textContent).toContain("Screenshot")
    })
})
