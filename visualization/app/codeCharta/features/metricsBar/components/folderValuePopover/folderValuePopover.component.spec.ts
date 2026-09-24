import { fireEvent, render, screen } from "@testing-library/angular"
import { RadialFolderValue } from "../../../../model/codeCharta.model"
import { FolderValuePopoverComponent } from "./folderValuePopover.component"

describe("FolderValuePopoverComponent", () => {
    async function setup({ selected = RadialFolderValue.Max, isNeutral = false } = {}) {
        const valueSelected = jest.fn()
        await render(FolderValuePopoverComponent, {
            inputs: { popoverId: "values", anchorName: "anchor", selected, isNeutral, colorMetric: "mcc" },
            on: { valueSelected }
        })
        return { valueSelected }
    }

    it("should list all six values, each with a description", async () => {
        // Arrange & Act
        await setup()

        // Assert
        const labels = screen
            .getAllByRole("radio", { hidden: true })
            .map(radio => radio.closest("label").querySelector(".font-medium").textContent)
        expect(labels).toEqual(["sum", "max", "min", "median", "mean / file", "avg / area"])
        expect(screen.getByText("Its lowest file. Never hides a low value, e.g. with inverted colors.")).not.toBeNull()
    })

    it("should check the selected value and name it in the title", async () => {
        // Arrange & Act
        await setup({ selected: RadialFolderValue.MeanPerFile })

        // Assert
        expect(screen.getByTestId("folder-value-meanPerFile").querySelector("input").checked).toBe(true)
        expect(screen.getByTestId("folder-value-max").querySelector("input").checked).toBe(false)
        expect(screen.getByTestId("folder-value-title").textContent).toBe("mean / file")
    })

    it("should say neutral and how to tint again while folders are neutral", async () => {
        // Arrange & Act
        await setup({ isNeutral: true })

        // Assert
        expect(screen.getByTestId("folder-value-title").textContent).toBe("neutral")
        expect(screen.getByText("Folders are one grey. Pick a value to tint them again.")).not.toBeNull()
    })

    it("should emit the checked value again when it is picked while neutral", async () => {
        // Arrange
        const { valueSelected } = await setup({ selected: RadialFolderValue.Max, isNeutral: true })

        // Act
        fireEvent.click(screen.getByTestId("folder-value-max"))

        // Assert
        expect(valueSelected).toHaveBeenCalledWith(RadialFolderValue.Max)
    })
})
