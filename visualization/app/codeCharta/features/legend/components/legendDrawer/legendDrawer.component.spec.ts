import { Component, OnDestroy } from "@angular/core"
import { fireEvent, render, screen } from "@testing-library/angular"
import { InspectorVisibilityService } from "../../../sidebarInspector/facade"
import { LegendDrawerComponent } from "./legendDrawer.component"

const legendLifecycle = { created: 0, destroyed: 0 }

@Component({
    selector: "cc-own-legend",
    template: `<p data-testid="own-legend">Edges</p>`
})
class OwnLegendComponent implements OnDestroy {
    constructor() {
        legendLifecycle.created++
    }

    ngOnDestroy(): void {
        legendLifecycle.destroyed++
    }
}

@Component({
    selector: "cc-legend-drawer-host",
    template: `<cc-legend-drawer><ng-template><cc-own-legend></cc-own-legend></ng-template></cc-legend-drawer>
        <button type="button">outside</button>`,
    imports: [LegendDrawerComponent, OwnLegendComponent]
})
class LegendDrawerHostComponent {}

const INSPECTOR_HIDDEN = { provide: InspectorVisibilityService, useValue: { isVisible: () => false } }
const INSPECTOR_SHOWN = { provide: InspectorVisibilityService, useValue: { isVisible: () => true } }

describe("LegendDrawerComponent", () => {
    beforeEach(() => {
        legendLifecycle.created = 0
        legendLifecycle.destroyed = 0
    })

    it("should not create the legend a view puts inside while the panel is closed", async () => {
        // Arrange & Act
        await render(LegendDrawerHostComponent, { providers: [INSPECTOR_HIDDEN] })

        // Assert
        expect(legendLifecycle.created).toBe(0)
    })

    it("should destroy the legend a view puts inside once the panel closes", async () => {
        // Arrange
        await render(LegendDrawerHostComponent, { providers: [INSPECTOR_HIDDEN] })
        fireEvent.click(screen.getByTestId("legend-panel-button"))

        // Act
        fireEvent.click(screen.getByTestId("legend-panel-button"))

        // Assert
        expect(legendLifecycle.created).toBe(1)
        expect(legendLifecycle.destroyed).toBe(1)
    })

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

    it("should stay at the right edge while a node is selected, as long as its view shows no inspector", async () => {
        // Arrange
        await render(LegendDrawerHostComponent, { providers: [INSPECTOR_SHOWN] })

        // Act
        fireEvent.click(screen.getByTestId("legend-panel-button"))

        // Assert
        expect(screen.getByTestId("legend-panel").style.right).toBe("40px")
        expect(screen.getByTestId("legend-panel-button").style.right).toBe("-28px")
    })
})
