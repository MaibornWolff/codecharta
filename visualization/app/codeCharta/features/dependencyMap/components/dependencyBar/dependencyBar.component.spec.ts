import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { DEPENDENCY_EDGE_TYPES } from "../../../../lenses/dependency/dependencyLens.facade"
import { edgeMetricDataSelector } from "../../../../renderer/renderModel/renderModel.facade"
import { edgeMetricSelector } from "../../../../stores/mapState/mapState.read.facade"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { DependencyMapViewStore } from "../../stores/dependencyMapView.store"
import { DependencyBarComponent } from "./dependencyBar.component"

const EDGE_METRICS = [
    { name: "dependencies", maxValue: 12, minValue: 1, values: [] },
    { name: "temporal_coupling", maxValue: 1, minValue: 0.1, values: [] }
]

function renderBar(edgeMetric = "dependencies") {
    return render(DependencyBarComponent, {
        providers: [
            { provide: State, useValue: { getValue: () => defaultState } },
            provideMockStore({
                initialState: defaultState,
                selectors: [
                    { selector: edgeMetricSelector, value: edgeMetric },
                    { selector: edgeMetricDataSelector, value: EDGE_METRICS }
                ]
            })
        ]
    })
}

describe("DependencyBarComponent", () => {
    it("should name the edges shown and the edge style", async () => {
        // Act
        await renderBar()

        // Assert
        expect(screen.getByTestId("dependency-bar-edge-metric-segment").textContent).toContain("dependencies")
        expect(screen.getByTestId("dependency-bar-edges-segment").textContent).toContain("All")
        expect(screen.getByTestId("dependency-bar-edge-style-segment").textContent).toContain("Curved")
        expect(screen.getByTestId("dependency-bar-edge-thickness-segment").textContent).toContain("By count")
    })

    it("should show only the edge types the reader leaves ticked", async () => {
        // Arrange
        await renderBar()

        // Act
        await userEvent.click(screen.getByTestId("dependency-bar-edges-regular"))
        await userEvent.click(screen.getByTestId("dependency-bar-edges-feedbackContainerLevel"))

        // Assert
        expect(TestBed.inject(DependencyMapViewStore).shownEdgeTypes()).toEqual(["cyclic", "feedbackLeafLevel"])
        expect(screen.getByTestId("dependency-bar-edges-segment").textContent).toContain("In a cycle, Points upward and closes a cycle")
    })

    it("should tick no type on None, every type on All and flip them on Invert", async () => {
        // Arrange
        await renderBar()
        const store = TestBed.inject(DependencyMapViewStore)

        // Act
        await userEvent.click(screen.getByRole("button", { name: "None" }))
        const afterNone = store.shownEdgeTypes()
        await userEvent.click(screen.getByTestId("dependency-bar-edges-cyclic"))
        await userEvent.click(screen.getByRole("button", { name: "Invert" }))
        const afterInvert = store.shownEdgeTypes()
        await userEvent.click(screen.getByRole("button", { name: "All" }))

        // Assert
        expect(afterNone).toEqual([])
        expect(afterInvert).toEqual(["regular", "feedbackContainerLevel", "feedbackLeafLevel"])
        expect(store.shownEdgeTypes()).toEqual(DEPENDENCY_EDGE_TYPES)
        expect(screen.getByTestId("dependency-bar-edges-segment").textContent).toContain("All")
    })

    it("should draw the edges in the style the reader picks", async () => {
        // Arrange
        await renderBar()

        // Act
        await userEvent.click(screen.getByTestId("dependency-bar-edge-style-straight"))

        // Assert
        expect(TestBed.inject(DependencyMapViewStore).edgeStyle()).toBe("straight")
    })

    it("should draw the edges as thick as the reader picks", async () => {
        // Arrange
        await renderBar()

        // Act
        await userEvent.click(screen.getByTestId("dependency-bar-edge-thickness-thin"))

        // Assert
        expect(TestBed.inject(DependencyMapViewStore).edgeWidth().thickness).toBe("thin")
    })

    it("should scale the edges' width by the factor the reader sets", async () => {
        // Arrange
        jest.useFakeTimers()
        await renderBar()
        const [factorInput] = screen.getAllByLabelText("Line width factor")

        // Act
        fireEvent.input(factorInput, { target: { value: "2.5" } })
        jest.runOnlyPendingTimers()
        jest.useRealTimers()

        // Assert
        expect(TestBed.inject(DependencyMapViewStore).edgeWidth().factor).toBe(2.5)
    })

    it("should anchor the edges at the middle of the sides once the reader ticks it", async () => {
        // Arrange
        await renderBar()

        // Act
        await userEvent.click(screen.getByLabelText("Start and end at the middle of the side"))

        // Assert
        expect(TestBed.inject(DependencyMapViewStore).isAnchoredAtSideMiddle()).toBe(true)
    })

    it("should offer only the dependency toggle for another edge metric, and name its choice after it", async () => {
        // Arrange
        await renderBar("temporal_coupling")

        // Act
        await userEvent.click(screen.getByRole("button", { name: "Invert" }))

        // Assert
        const disabledTypes = DEPENDENCY_EDGE_TYPES.filter(type =>
            screen.getByTestId(`dependency-bar-edges-${type}`).hasAttribute("disabled")
        )
        expect(disabledTypes).toEqual(["cyclic", "feedbackContainerLevel", "feedbackLeafLevel"])
        expect(TestBed.inject(DependencyMapViewStore).shownEdgeTypes()).toEqual(["cyclic", "feedbackContainerLevel", "feedbackLeafLevel"])
        expect(screen.getByTestId("dependency-bar-edges-segment").textContent).toContain("None")
    })
})
