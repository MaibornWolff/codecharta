import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { ConfirmDialogComponent } from "./confirmDialog.component"

const inputs = { title: "Confirm clear flatten rules", message: "All 3 flatten rules are removed." }

describe("ConfirmDialogComponent", () => {
    beforeEach(() => {
        // jsdom stubs for native <dialog>
        HTMLDialogElement.prototype.showModal = jest.fn()
        HTMLDialogElement.prototype.close = jest.fn()
    })

    it("should show the title and the message", async () => {
        // Arrange & Act
        const { fixture } = await render(ConfirmDialogComponent, { inputs })
        fixture.componentInstance.open()

        // Assert
        expect(screen.getByText("Confirm clear flatten rules")).not.toBe(null)
        expect(screen.getByText("All 3 flatten rules are removed.")).not.toBe(null)
    })

    it("should report a confirmation when Yes is clicked", async () => {
        // Arrange
        const confirmed = jest.fn()
        const { fixture } = await render(ConfirmDialogComponent, { inputs, on: { confirmed } })
        fixture.componentInstance.open()

        // Act
        await userEvent.click(screen.getByTestId("confirm-dialog-yes"))

        // Assert
        expect(confirmed).toHaveBeenCalledTimes(1)
    })

    it("should report nothing when No is clicked", async () => {
        // Arrange
        const confirmed = jest.fn()
        const { fixture } = await render(ConfirmDialogComponent, { inputs, on: { confirmed } })
        fixture.componentInstance.open()

        // Act
        await userEvent.click(screen.getByTestId("confirm-dialog-no"))

        // Assert
        expect(confirmed).not.toHaveBeenCalled()
    })
})
