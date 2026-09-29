import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { DependencyMapViewStore } from "../../stores/dependencyMapView.store"
import { DependencyBarComponent } from "./dependencyBar.component"

describe("DependencyBarComponent", () => {
    it("should name the edges shown and the edge style", async () => {
        // Act
        await render(DependencyBarComponent)

        // Assert
        expect(screen.getByTestId("dependency-bar-edges-segment").textContent).toContain("All")
        expect(screen.getByTestId("dependency-bar-edge-style-segment").textContent).toContain("Curved")
    })

    it("should show the edges the reader picks", async () => {
        // Arrange
        await render(DependencyBarComponent)

        // Act
        await userEvent.click(screen.getByTestId("dependency-bar-edges-cycles"))

        // Assert
        expect(TestBed.inject(DependencyMapViewStore).edgeFilter()).toBe("cycles")
        expect(screen.getByTestId("dependency-bar-edges-segment").textContent).toContain("Cycles")
        expect(screen.getByTestId("dependency-bar-edges-cycles").getAttribute("aria-pressed")).toBe("true")
    })

    it("should draw the edges in the style the reader picks", async () => {
        // Arrange
        await render(DependencyBarComponent)

        // Act
        await userEvent.click(screen.getByTestId("dependency-bar-edge-style-straight"))

        // Assert
        expect(TestBed.inject(DependencyMapViewStore).edgeStyle()).toBe("straight")
    })
})
