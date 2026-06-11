import { TestBed } from "@angular/core/testing"
import { render, screen, waitFor } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { InspectorComparisonModeService } from "../../services/inspectorComparisonMode.service"
import { InspectorComparisonToggleComponent } from "./inspectorComparisonToggle.component"

describe("InspectorComparisonToggleComponent", () => {
    it("should mark the map mode as active by default", async () => {
        // Arrange & Act
        await render(InspectorComparisonToggleComponent)

        // Assert
        expect(screen.getByTestId("inspector-comparison-map").className).toContain("btn-active")
        expect(screen.getByTestId("inspector-comparison-range").className).not.toContain("btn-active")
    })

    it("should switch the comparison mode when clicking range", async () => {
        // Arrange
        await render(InspectorComparisonToggleComponent)

        // Act
        await userEvent.click(screen.getByTestId("inspector-comparison-range"))

        // Assert
        await waitFor(() => expect(screen.getByTestId("inspector-comparison-range").className).toContain("btn-active"))
        expect(TestBed.inject(InspectorComparisonModeService).comparisonMode()).toBe("range")
    })
})
