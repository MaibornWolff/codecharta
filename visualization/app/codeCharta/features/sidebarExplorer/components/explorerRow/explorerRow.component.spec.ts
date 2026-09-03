import { render } from "@testing-library/angular"
import { ExplorerRowComponent } from "./explorerRow.component"

describe("ExplorerRowComponent", () => {
    const rowOf = (container: Element) => container.querySelector(".tree-element-label") as HTMLElement

    it("should carry the id the hosting list gives it, so it can be scrolled to", async () => {
        // Arrange & Act
        const { container } = await render(ExplorerRowComponent, { inputs: { rowId: "domain:/root" } })

        // Assert
        expect(rowOf(container).id).toBe("domain:/root")
    })

    it("should state a decoration next to the row content", async () => {
        // Arrange & Act
        const { container } = await render(ExplorerRowComponent, { inputs: { decoration: "80% / 8" } })

        // Assert
        expect(rowOf(container).textContent).toContain("80% / 8")
    })

    it("should leave the decoration out when the row has none", async () => {
        // Arrange & Act
        const { container } = await render(ExplorerRowComponent)

        // Assert
        expect(rowOf(container).textContent?.trim()).toBe("")
    })

    it("should mark a selected row, and not paint the hover on top of it", async () => {
        // Arrange & Act
        const { container } = await render(ExplorerRowComponent, { inputs: { isSelected: true, isHovered: true } })

        // Assert
        expect(rowOf(container).classList.contains("selected")).toBe(true)
        expect(rowOf(container).classList.contains("bg-base-200")).toBe(false)
    })

    it("should mark a hovered, marked and revealed row", async () => {
        // Arrange & Act
        const { container } = await render(ExplorerRowComponent, {
            inputs: { isHovered: true, isMarked: true, isRevealed: true }
        })

        // Assert
        const row = rowOf(container)
        expect(row.classList.contains("bg-base-200")).toBe(true)
        expect(row.classList.contains("marked")).toBe(true)
        expect(row.classList.contains("bg-primary/20")).toBe(true)
    })

    it("should fill the row with a bar as long as the share it states", async () => {
        // Arrange & Act
        const { container } = await render(ExplorerRowComponent, { inputs: { barShare: 0.42, decoration: "42% / 8" } })

        // Assert
        expect((rowOf(container).querySelector(".bg-primary\\/10") as HTMLElement).style.width).toBe("42%")
    })

    it("should leave the bar out of a row without a share", async () => {
        // Arrange & Act
        const { container } = await render(ExplorerRowComponent, { inputs: { decoration: "8" } })

        // Assert
        expect(rowOf(container).querySelector(".bg-primary\\/10")).toBe(null)
    })
})
