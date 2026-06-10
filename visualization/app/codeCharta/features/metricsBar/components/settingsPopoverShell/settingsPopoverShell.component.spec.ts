import { Component } from "@angular/core"
import { render } from "@testing-library/angular"
import { SettingsPopoverShellComponent } from "./settingsPopoverShell.component"

@Component({
    template: `<cc-settings-popover-shell
        [popoverId]="popoverId"
        [anchorName]="anchorName"
        [widthClass]="widthClass"
        [testId]="testId"
    >
        <span data-testid="projected-body">Body</span>
    </cc-settings-popover-shell>`,
    imports: [SettingsPopoverShellComponent]
})
class HostComponent {
    popoverId = "metric-settings-popover-area"
    anchorName = "metric-segment-area-cog"
    widthClass = "w-72"
    testId: string | null = null
}

describe("SettingsPopoverShellComponent", () => {
    async function setup(overrides: Partial<HostComponent> = {}) {
        const renderResult = await render(HostComponent, { componentProperties: overrides })
        const shell = renderResult.container.querySelector("[popover]") as HTMLElement
        return { renderResult, shell }
    }

    it("should render the shared popover shell attributes from inputs", async () => {
        // Arrange & Act
        const { shell } = await setup()

        // Assert
        expect(shell.getAttribute("popover")).toBe("")
        expect(shell.id).toBe("metric-settings-popover-area")
        expect(shell.style.getPropertyValue("position-anchor")).toBe("--metric-segment-area-cog")
        expect(shell.style.getPropertyValue("position-area")).toBe("top span-right")
        expect(shell.className).toContain("dropdown")
        expect(shell.className).toContain("rounded-box")
        expect(shell.className).toContain("bg-base-100")
        expect(shell.className).toContain("shadow-lg")
    })

    it("should project the body content via ng-content", async () => {
        // Arrange & Act
        const { renderResult, shell } = await setup()

        // Assert
        expect(shell.querySelector("[data-testid='projected-body']")).not.toBeNull()
        expect(renderResult.getByText("Body")).toBeTruthy()
    })

    it("should apply the default width class when none is provided", async () => {
        // Arrange & Act
        const renderResult = await render(SettingsPopoverShellComponent, {
            inputs: { popoverId: "id", anchorName: "anchor" }
        })
        const shell = renderResult.container.querySelector("[popover]") as HTMLElement

        // Assert
        expect(shell.className).toContain("w-72")
    })

    it("should apply a custom width class", async () => {
        // Arrange & Act
        const { shell } = await setup({ widthClass: "w-80" })

        // Assert
        expect(shell.className).toContain("w-80")
    })

    it("should not render a data-testid attribute when no testId is provided", async () => {
        // Arrange & Act
        const { shell } = await setup()

        // Assert
        expect(shell.hasAttribute("data-testid")).toBe(false)
    })

    it("should render the data-testid attribute when a testId is provided", async () => {
        // Arrange & Act
        const { shell } = await setup({ testId: "settings-popover-shell" })

        // Assert
        expect(shell.getAttribute("data-testid")).toBe("settings-popover-shell")
    })
})
