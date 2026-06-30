import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { TestBed } from "@angular/core/testing"
import { defaultState } from "../../../../../../state/store/state.manager"
import { attributeDescriptorsSelector } from "../../../../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { LegendMetricRowComponent } from "./legendMetricRow.component"

describe("LegendMetricRowComponent", () => {
    let store: MockStore | undefined

    afterEach(() => {
        store?.resetSelectors()
        store = undefined
    })

    async function setup(inputs: { label: string; metricName: string }) {
        const renderResult = await render(LegendMetricRowComponent, {
            inputs,
            providers: [provideMockStore({ initialState: defaultState }), { provide: State, useValue: { getValue: () => defaultState } }]
        })
        store = TestBed.inject(MockStore)
        return { renderResult, store }
    }

    it("should render the fallback title when no attribute descriptor exists", async () => {
        // Arrange & Act
        await setup({ label: "Area", metricName: "rloc" })

        // Assert
        expect(screen.getByText("Area")).not.toBeNull()
        expect(screen.getByText("Real Lines of Code")).not.toBeNull()
    })

    it("should render the metric name when neither a descriptor nor a fallback title exists", async () => {
        // Arrange & Act
        await setup({ label: "Height", metricName: "some_custom_metric" })

        // Assert
        expect(screen.getByText("some_custom_metric")).not.toBeNull()
    })

    it("should render the descriptor title as plain text without a link", async () => {
        // Arrange
        const { renderResult, store } = await setup({ label: "Color", metricName: "mcc" })

        // Act
        store.overrideSelector(attributeDescriptorsSelector, {
            mcc: { title: "Logic complexity", description: "", hintHighValue: "", hintLowValue: "", link: "https://example.com" }
        })
        store.refreshState()
        renderResult.detectChanges()

        // Assert
        expect(screen.getByText("Logic complexity")).not.toBeNull()
        expect(screen.queryByRole("link")).toBeNull()
    })
})
