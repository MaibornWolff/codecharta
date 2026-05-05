import { render, screen } from "@testing-library/angular"
import { ExplorerCountChipComponent } from "./explorerCountChip.component"

describe("ExplorerCountChipComponent", () => {
    it("should render label and count", async () => {
        // Arrange & Act
        await render(ExplorerCountChipComponent, {
            inputs: { label: "Shown", count: 47 }
        })

        // Assert
        expect(screen.getByText("Shown")).not.toBe(null)
        expect(screen.getByText("47")).not.toBe(null)
    })

    it("should render as static span when no popoverId set", async () => {
        // Arrange & Act
        const { container } = await render(ExplorerCountChipComponent, {
            inputs: { label: "Shown", count: 47 }
        })

        // Assert
        expect(container.querySelector("button")).toBe(null)
        expect(container.querySelector("span")).not.toBe(null)
    })

    it("should render as button with popovertarget when popoverId set", async () => {
        // Arrange & Act
        const { container } = await render(ExplorerCountChipComponent, {
            inputs: { label: "Flattened", count: 12, popoverId: "flatten-popover" }
        })

        // Assert
        const button = container.querySelector("button")
        expect(button).not.toBe(null)
        expect(button?.getAttribute("popovertarget")).toBe("flatten-popover")
    })

    it("should set anchor-name style when anchorName provided", async () => {
        // Arrange & Act
        const { container } = await render(ExplorerCountChipComponent, {
            inputs: { label: "Flattened", count: 0, popoverId: "flatten-popover", anchorName: "flat-chip" }
        })

        // Assert
        const button = container.querySelector("button")
        expect(button?.getAttribute("style")).toContain("anchor-name: --flat-chip")
    })
})
