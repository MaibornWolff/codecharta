import { Component, OnDestroy, signal } from "@angular/core"
import { fireEvent, render, screen } from "@testing-library/angular"
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
    template: `<cc-legend-drawer [isMovedAsideByInspector]="isInspectorShown()"><ng-template><cc-own-legend></cc-own-legend></ng-template></cc-legend-drawer>
        <button type="button">outside</button>`,
    imports: [LegendDrawerComponent, OwnLegendComponent]
})
class LegendDrawerHostComponent {
    readonly isInspectorShown = signal(false)
}

describe("LegendDrawerComponent", () => {
    beforeEach(() => {
        legendLifecycle.created = 0
        legendLifecycle.destroyed = 0
    })

    it("should not create the legend a view puts inside while the panel is closed", async () => {
        // Arrange & Act
        await render(LegendDrawerHostComponent)

        // Assert
        expect(legendLifecycle.created).toBe(0)
    })

    it("should destroy the legend a view puts inside once the panel closes", async () => {
        // Arrange
        await render(LegendDrawerHostComponent)
        fireEvent.click(screen.getByTestId("legend-panel-button"))

        // Act
        fireEvent.click(screen.getByTestId("legend-panel-button"))

        // Assert
        expect(legendLifecycle.created).toBe(1)
        expect(legendLifecycle.destroyed).toBe(1)
    })

    it("should show the legend a view puts inside once the tab is clicked", async () => {
        // Arrange
        await render(LegendDrawerHostComponent)
        const hiddenAtFirst = screen.queryByTestId("own-legend")

        // Act
        fireEvent.click(screen.getByTestId("legend-panel-button"))

        // Assert
        expect(hiddenAtFirst).toBeNull()
        expect(screen.getByTestId("own-legend").textContent).toBe("Edges")
    })

    it("should close when the pointer goes down outside it", async () => {
        // Arrange
        await render(LegendDrawerHostComponent)
        fireEvent.click(screen.getByTestId("legend-panel-button"))

        // Act
        fireEvent.mouseDown(screen.getByText("outside"))

        // Assert
        expect(screen.queryByTestId("legend-panel")).toBeNull()
    })

    it("should stay at the right edge until its view says an inspector is shown, then move aside by the inspector's width", async () => {
        // Arrange
        const { fixture } = await render(LegendDrawerHostComponent)
        fireEvent.click(screen.getByTestId("legend-panel-button"))
        const rightOf = () => [screen.getByTestId("legend-panel").style.right, screen.getByTestId("legend-panel-button").style.right]
        const atTheEdge = rightOf()

        // Act
        fixture.componentInstance.isInspectorShown.set(true)
        fixture.detectChanges()

        // Assert
        expect(atTheEdge).toEqual(["40px", "-28px"])
        expect(rightOf()).toEqual(["calc(var(--cc-inspector-width) + 40px)", "calc(var(--cc-inspector-width) - 28px)"])
    })
})
