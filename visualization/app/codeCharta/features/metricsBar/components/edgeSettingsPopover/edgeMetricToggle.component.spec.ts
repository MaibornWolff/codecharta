import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import { TestBed } from "@angular/core/testing"
import { of } from "rxjs"
import { defaultState } from "../../../../state/store/state.manager"
import { isEdgeMetricVisibleSelector, toggleEdgeMetricVisible } from "../../../../appearance/appearance.facade"
import { CodeMapRenderService } from "../../../../features/codeMap/facade"
import { EdgeMetricToggleComponent } from "./edgeMetricToggle.component"

describe("EdgeMetricToggleComponent", () => {
    async function setup(isEdgeMetricVisible = true) {
        return render(EdgeMetricToggleComponent, {
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [{ selector: isEdgeMetricVisibleSelector, value: isEdgeMetricVisible }]
                }),
                { provide: State, useValue: { getValue: () => defaultState } },
                {
                    provide: CodeMapRenderService,
                    useValue: {
                        getNodes: () => [],
                        sortVisibleNodesByHeightDescending: () => [],
                        colorCategoryCounts$: of({ positive: 0, neutral: 0, negative: 0 })
                    }
                }
            ]
        })
    }

    it("should render the disable edge metric label", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByText("Disable edge metric")).not.toBeNull()
    })

    it("should reflect visible state with an unchecked checkbox", async () => {
        // Arrange & Act
        await setup(true)

        // Assert
        const checkbox = screen.getByRole("checkbox") as HTMLInputElement
        expect(checkbox.checked).toBe(false)
    })

    it("should reflect hidden state with a checked checkbox", async () => {
        // Arrange & Act
        await setup(false)

        // Assert
        const checkbox = screen.getByRole("checkbox") as HTMLInputElement
        expect(checkbox.checked).toBe(true)
    })

    it("should dispatch toggleEdgeMetricVisible when the checkbox changes", async () => {
        // Arrange
        await setup(true)
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        const checkbox = screen.getByRole("checkbox")

        // Act
        fireEvent.click(checkbox)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledTimes(1)
        expect(dispatchSpy).toHaveBeenCalledWith(toggleEdgeMetricVisible())
    })

    it("should dispatch toggleEdgeMetricVisible when re-enabling from a hidden state", async () => {
        // Arrange
        await setup(false)
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        const checkbox = screen.getByRole("checkbox")

        // Act
        fireEvent.click(checkbox)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledTimes(1)
        expect(dispatchSpy).toHaveBeenCalledWith(toggleEdgeMetricVisible())
    })

    it("should expose the current visibility via the isEdgeMetricVisible signal", async () => {
        // Arrange & Act
        const { fixture } = await setup(false)

        // Assert
        expect(fixture.componentInstance.isEdgeMetricVisible()).toBe(false)
    })
})
