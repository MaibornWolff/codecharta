import { Component } from "@angular/core"
import { fireEvent, render, screen } from "@testing-library/angular"
import { InspectorVisibilityService } from "../../../sidebarInspector/facade"
import { LegendDrawerComponent } from "./legendDrawer.component"

@Component({
    selector: "cc-legend-drawer-host",
    template: `<cc-legend-drawer><p data-testid="own-legend">Edges</p></cc-legend-drawer><button type="button">outside</button>`,
    imports: [LegendDrawerComponent]
})
class LegendDrawerHostComponent {}

const INSPECTOR_HIDDEN = { provide: InspectorVisibilityService, useValue: { isVisible: () => false } }

describe("LegendDrawerComponent", () => {
    it("should show the legend a view puts inside once the tab is clicked", async () => {
        // Arrange
        await render(LegendDrawerHostComponent, { providers: [INSPECTOR_HIDDEN] })
        const hiddenAtFirst = screen.queryByTestId("own-legend")

        // Act
        fireEvent.click(screen.getByTestId("legend-panel-button"))

        // Assert
        expect(hiddenAtFirst).toBeNull()
        expect(screen.getByTestId("own-legend").textContent).toBe("Edges")
    })

    it("should close when the pointer goes down outside it", async () => {
        // Arrange
        await render(LegendDrawerHostComponent, { providers: [INSPECTOR_HIDDEN] })
        fireEvent.click(screen.getByTestId("legend-panel-button"))

        // Act
        fireEvent.mouseDown(screen.getByText("outside"))

        // Assert
        expect(screen.queryByTestId("legend-panel")).toBeNull()
    })
})
