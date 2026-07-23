import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { ToastService } from "../../services/toast.service"
import { ToastComponent } from "./toast.component"

describe("ToastComponent", () => {
    async function renderComponent(toastService: Partial<ToastService>) {
        return render(ToastComponent, {
            providers: [{ provide: ToastService, useValue: toastService }]
        })
    }

    it("should render each active message from the service", async () => {
        // Arrange & Act
        await renderComponent({
            messages: (() => [{ id: 0, text: "no domain data", severity: "info" as const }]) as ToastService["messages"]
        })

        // Assert
        expect(screen.getByText("no domain data")).toBeTruthy()
    })

    it("should announce messages through an aria-live status region", async () => {
        // Arrange & Act
        await renderComponent({
            messages: (() => [{ id: 0, text: "announced", severity: "info" as const }]) as ToastService["messages"]
        })

        // Assert
        const statusRegion = screen.getByRole("status")
        expect(statusRegion.getAttribute("aria-live")).toBe("polite")
    })

    it("should dismiss the message through the service when the close button is clicked", async () => {
        // Arrange
        const dismiss = jest.fn()
        await renderComponent({
            messages: (() => [{ id: 7, text: "closeable", severity: "info" as const }]) as ToastService["messages"],
            dismiss
        })

        // Act
        await userEvent.click(screen.getByLabelText("Dismiss notification"))

        // Assert
        expect(dismiss).toHaveBeenCalledWith(7)
    })
})
