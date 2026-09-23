import { render, screen } from "@testing-library/angular"
import { RadialFolderValue } from "../../../../model/codeCharta.model"
import { FolderValuePopoverComponent } from "./folderValuePopover.component"

describe("FolderValuePopoverComponent", () => {
    async function setup({ selected = RadialFolderValue.Max, isNeutral = false } = {}) {
        return render(FolderValuePopoverComponent, {
            inputs: { popoverId: "values", anchorName: "anchor", selected, isNeutral, colorMetric: "mcc" }
        })
    }

    it("should list all seven values in two groups, each with a description", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getAllByRole("radio", { hidden: true })).toHaveLength(7)
        expect(screen.getByText("On the file thresholds")).not.toBeNull()
        expect(screen.getByText("Own scale (not the file thresholds)")).not.toBeNull()
        expect(screen.getByText("Its worst file. Never hides a hotspot.")).not.toBeNull()
    })

    it("should check the selected value and name it in the title", async () => {
        // Arrange & Act
        await setup({ selected: RadialFolderValue.MeanPerFile })

        // Assert
        expect(screen.getByTestId("folder-value-meanPerFile").getAttribute("aria-checked")).toBe("true")
        expect(screen.getByTestId("folder-value-max").getAttribute("aria-checked")).toBe("false")
        expect(screen.getByTestId("folder-value-title").textContent).toBe("mean / file")
    })

    it("should say neutral and how to tint again while folders are neutral", async () => {
        // Arrange & Act
        await setup({ isNeutral: true })

        // Assert
        expect(screen.getByTestId("folder-value-title").textContent).toBe("neutral")
        expect(screen.getByText("Folders are one grey. Pick a value to tint them again.")).not.toBeNull()
    })
})
