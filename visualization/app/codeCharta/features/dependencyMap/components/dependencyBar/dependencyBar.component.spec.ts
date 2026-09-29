import { TestBed } from "@angular/core/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
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
        expect(screen.getByTestId("dependency-bar-edge-thickness-segment").textContent).toContain("By count")
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

    it("should draw the edges as thick as the reader picks", async () => {
        // Arrange
        await render(DependencyBarComponent)

        // Act
        await userEvent.click(screen.getByTestId("dependency-bar-edge-thickness-thin"))

        // Assert
        expect(TestBed.inject(DependencyMapViewStore).edgeWidth().thickness).toBe("thin")
    })

    it("should scale the edges' width by the factor the reader sets", async () => {
        // Arrange
        jest.useFakeTimers()
        await render(DependencyBarComponent)
        const [factorInput] = screen.getAllByLabelText("Line width factor")

        // Act
        fireEvent.input(factorInput, { target: { value: "2.5" } })
        jest.runOnlyPendingTimers()
        jest.useRealTimers()

        // Assert
        expect(TestBed.inject(DependencyMapViewStore).edgeWidth().factor).toBe(2.5)
    })
})
