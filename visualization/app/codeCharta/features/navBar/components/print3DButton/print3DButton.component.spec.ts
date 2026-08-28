import { render, screen } from "@testing-library/angular"
import { Export3DMapDialogStore } from "../../../3dPrint/facade"
import { Print3DButtonComponent } from "./print3DButton.component"

describe("Print3DButtonComponent", () => {
    let export3DMapDialogStore: { requestExport: jest.Mock }

    async function setup() {
        export3DMapDialogStore = { requestExport: jest.fn() }
        return render(Print3DButtonComponent, {
            providers: [{ provide: Export3DMapDialogStore, useValue: export3DMapDialogStore }]
        })
    }

    it("should render the button labelled 3D Print", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByRole("button", { name: "3D Print" })).not.toBeNull()
    })

    it("should ask for the export when clicked", async () => {
        // Arrange
        await setup()

        // Act
        screen.getByRole("button", { name: "3D Print" }).click()

        // Assert — the dialog is hosted by the always-mounted nav bar, not by this button
        expect(export3DMapDialogStore.requestExport).toHaveBeenCalledTimes(1)
    })

    it("should stay clickable so the store can offer the view switch", async () => {
        // Arrange & Act — the store decides whether the export can run, not the button
        await setup()

        // Assert
        expect(screen.getByRole("button", { name: "3D Print" }).hasAttribute("disabled")).toBe(false)
    })
})
