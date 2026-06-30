import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import { isDeltaStateSelector } from "../../../../../../state/selectors/isDeltaState.selector"
import { edgeMetricSelector } from "../../../../../../state/store/dynamicSettings/edgeMetric/edgeMetric.selector"
import { defaultState } from "../../../../../../state/store/state.manager"
import { InspectorVisibilityService } from "../../../../../../features/sidebarInspector/facade"
import { LegendPanelComponent } from "./legendPanel.component"

describe("LegendPanelComponent", () => {
    let store: MockStore | undefined

    afterEach(() => {
        store?.resetSelectors()
        store = undefined
    })

    async function setup({ isInspectorVisible = false } = {}) {
        const renderResult = await render(LegendPanelComponent, {
            providers: [
                provideMockStore({ initialState: defaultState }),
                { provide: State, useValue: { getValue: () => defaultState } },
                ...(isInspectorVisible ? [{ provide: InspectorVisibilityService, useValue: { isVisible: () => true } }] : [])
            ]
        })
        store = TestBed.inject(MockStore)
        return { renderResult, store }
    }

    it("should only render the toggle button initially", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByText("LEGEND")).not.toBeNull()
        expect(screen.queryByTestId("legend-panel")).toBeNull()
    })

    it("should open the panel when the toggle button is clicked", async () => {
        // Arrange
        await setup()

        // Act
        fireEvent.click(screen.getByText("LEGEND"))

        // Assert
        expect(screen.getByTestId("legend-panel")).not.toBeNull()
        expect(screen.getByText("Color scale")).not.toBeNull()
    })

    it("should close the panel when clicking outside of it", async () => {
        // Arrange
        await setup()
        fireEvent.click(screen.getByText("LEGEND"))

        // Act
        fireEvent.mouseDown(document.body)

        // Assert
        expect(screen.queryByTestId("legend-panel")).toBeNull()
    })

    it("should keep the panel open when clicking inside of it", async () => {
        // Arrange
        await setup()
        fireEvent.click(screen.getByText("LEGEND"))

        // Act
        fireEvent.mouseDown(screen.getByText("Color scale"))

        // Assert
        expect(screen.getByTestId("legend-panel")).not.toBeNull()
    })

    it("should show delta colors instead of metric rows and color scale in delta mode", async () => {
        // Arrange
        const { renderResult, store } = await setup()
        store.overrideSelector(isDeltaStateSelector, true)
        store.refreshState()
        renderResult.detectChanges()

        // Act
        fireEvent.click(screen.getByText("LEGEND"))

        // Assert
        expect(screen.getByText("Delta colors")).not.toBeNull()
        expect(screen.getByText("+Δ positive delta")).not.toBeNull()
        expect(screen.getByText("–Δ negative delta")).not.toBeNull()
        expect(screen.queryByText("Color scale")).toBeNull()
    })

    it("should shift the panel and the button left when the inspector sidebar is visible", async () => {
        // Arrange
        await setup({ isInspectorVisible: true })

        // Act
        fireEvent.click(screen.getByText("LEGEND"))

        // Assert
        expect(screen.getByTestId("legend-panel").style.right).toBe("calc(var(--cc-inspector-width) + 40px)")
        expect(screen.getByTestId("legend-panel-button").style.right).toBe("calc(var(--cc-inspector-width) - 28px)")
    })

    it("should show edge color rows when an edge metric is selected", async () => {
        // Arrange
        const { renderResult, store } = await setup()
        store.overrideSelector(edgeMetricSelector, "pairingRate")
        store.refreshState()
        renderResult.detectChanges()

        // Act
        fireEvent.click(screen.getByText("LEGEND"))

        // Assert
        expect(screen.getByText("Edge")).not.toBeNull()
        expect(screen.getByText("Outgoing Edge")).not.toBeNull()
        expect(screen.getByText("Incoming Edge")).not.toBeNull()
    })
})
