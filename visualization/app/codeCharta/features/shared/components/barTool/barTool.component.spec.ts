import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { BarToolComponent } from "./barTool.component"

type BarToolInputs = Partial<{
    label: string
    icon: string
    tooltip: string | null
    disabled: boolean
    pressed: boolean | null
    highlighted: boolean
    revealed: boolean
    testId: string | null
}>

function renderTool(inputs: BarToolInputs = {}) {
    return render(BarToolComponent, { inputs: { label: "Center map", icon: "fa fa-compass", ...inputs } })
}

function tool(): HTMLButtonElement {
    return screen.getByRole("button", { name: "Center map" }) as HTMLButtonElement
}

describe("BarToolComponent", () => {
    it("should name the button by its label and show the label before the icon", async () => {
        // Act
        await renderTool()

        // Assert
        expect(tool().textContent.trim()).toBe("Center map")
        expect(tool().lastElementChild.className).toBe("fa fa-compass text-xs")
    })

    it("should emit activated when the reader clicks it", async () => {
        // Arrange
        const { fixture } = await renderTool()
        const activated = jest.fn()
        fixture.componentInstance.activated.subscribe(activated)

        // Act
        await userEvent.click(tool())

        // Assert
        expect(activated).toHaveBeenCalledTimes(1)
    })

    it("should neither emit nor accept clicks while disabled", async () => {
        // Arrange
        const { fixture } = await renderTool({ disabled: true })
        const activated = jest.fn()
        fixture.componentInstance.activated.subscribe(activated)

        // Act
        await userEvent.click(tool())

        // Assert
        expect(tool().disabled).toBe(true)
        expect(activated).not.toHaveBeenCalled()
    })

    it("should leave out the pressed state and the tooltip unless given", async () => {
        // Act
        await renderTool()

        // Assert
        expect(tool().hasAttribute("aria-pressed")).toBe(false)
        expect(tool().hasAttribute("title")).toBe(false)
    })

    it("should mark a pressed toggle as pressed and tint it", async () => {
        // Act
        await renderTool({ pressed: true, tooltip: "Disable flashlight hover effect" })

        // Assert
        expect(tool().getAttribute("aria-pressed")).toBe("true")
        expect(tool().getAttribute("title")).toBe("Disable flashlight hover effect")
        expect(tool().classList).toContain("bg-primary/15")
    })

    it("should color a highlighted tool without tinting its background", async () => {
        // Act
        await renderTool({ highlighted: true })

        // Assert
        expect(tool().classList).toContain("text-secondary")
        expect(tool().classList).not.toContain("bg-primary/15")
    })

    it("should collapse and make inert a tool that is not revealed", async () => {
        // Act
        const { fixture } = await renderTool({ revealed: false, testId: "center-map" })

        // Assert
        const host: HTMLElement = fixture.nativeElement
        expect(host.hasAttribute("inert")).toBe(true)
        expect(host.style.gridTemplateColumns).toBe("0fr")
        expect(screen.getByTestId("center-map")).toBe(tool())
    })

    it("should open a revealed tool to its full width", async () => {
        // Act
        const { fixture } = await renderTool()

        // Assert
        const host: HTMLElement = fixture.nativeElement
        expect(host.hasAttribute("inert")).toBe(false)
        expect(host.style.gridTemplateColumns).toBe("1fr")
    })
})
