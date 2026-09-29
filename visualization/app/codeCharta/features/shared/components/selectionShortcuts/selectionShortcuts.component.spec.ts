import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { SelectionShortcutsComponent } from "./selectionShortcuts.component"

describe("SelectionShortcutsComponent", () => {
    it.each([
        ["All", "selectAll"],
        ["None", "selectNone"],
        ["Invert", "invert"]
    ] as const)("should announce a click on %s", async (label, outputName) => {
        // Arrange
        const clicked = jest.fn()
        await render(SelectionShortcutsComponent, { on: { [outputName]: clicked } })

        // Act
        await userEvent.click(screen.getByRole("button", { name: label }))

        // Assert
        expect(clicked).toHaveBeenCalledTimes(1)
    })
})
