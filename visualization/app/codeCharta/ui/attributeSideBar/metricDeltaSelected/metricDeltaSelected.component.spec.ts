import { render, screen } from "@testing-library/angular"

import { ColorConverter } from "../../../util/color/colorConverter"
import { MetricDeltaSelectedComponent } from "./metricDeltaSelected.component"
import { TestBed } from "@angular/core/testing"
import { provideMockStore, MockStore } from "@ngrx/store/testing"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"
import { CodeMapNode } from "../../../codeCharta.model"
import { defaultMapColors } from "../../../state/store/appSettings/mapColors/mapColors.reducer"
import { mapColorsSelector } from "../../../state/store/appSettings/mapColors/mapColors.selector"

describe("MetricDeltaSelectedComponent", () => {
    const areColorsEqual = (hex: string, styleColor: string) => {
        const formattedHex = ColorConverter.convertHexToRgba(hex).replace(/,1\)$/, ")").replace("a", "")
        const formattedStyleColor = styleColor.replaceAll(" ", "")
        return formattedHex === formattedStyleColor
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideMockStore({
                    selectors: [
                        { selector: selectedNodeSelector, value: null },
                        { selector: mapColorsSelector, value: defaultMapColors }
                    ]
                })
            ]
        })
    })

    it("should not show, if there is no delta value", async () => {
        await render(MetricDeltaSelectedComponent)
        expect(screen.queryByText(/Δ/)).toBe(null)
    })

    it("should show in positive delta color when selected building has a positive delta value", async () => {
        const { detectChanges } = await render(MetricDeltaSelectedComponent, {
            componentProperties: { metricName: "rloc" }
        })
        const store = TestBed.inject(MockStore)
        mockSelectedNode(store, detectChanges, { rloc: 2 })

        const metricDeltaSelectedDomNode = screen.queryByText(/Δ2/)
        expect(metricDeltaSelectedDomNode).toBeTruthy()
        expect(areColorsEqual(defaultMapColors.positiveDelta, metricDeltaSelectedDomNode.style.color)).toBe(true)
    })

    it("should show in negative delta color when selected building has a negative delta value", async () => {
        const { detectChanges } = await render(MetricDeltaSelectedComponent, {
            componentProperties: { metricName: "rloc" }
        })
        const store = TestBed.inject(MockStore)
        mockSelectedNode(store, detectChanges, { rloc: -2 })

        const metricDeltaSelectedDomNode = screen.queryByText(/Δ-2/)
        expect(metricDeltaSelectedDomNode).toBeTruthy()
        expect(areColorsEqual(defaultMapColors.negativeDelta, metricDeltaSelectedDomNode.style.color)).toBe(true)
    })

    it("should update when its metricName changes", async () => {
        const { rerender, detectChanges } = await render(MetricDeltaSelectedComponent, {
            componentProperties: { metricName: "rloc" }
        })
        const store = TestBed.inject(MockStore)
        mockSelectedNode(store, detectChanges, { rloc: 2, mcc: 4 })

        expect(screen.queryByText(/Δ2/)).toBeTruthy()

        await rerender({ componentProperties: { metricName: "mcc" } })
        expect(screen.queryByText(/Δ4/)).toBeTruthy()
    })

    function mockSelectedNode(store: MockStore, detectChanges: () => void, deltas: Record<string, unknown>) {
        store.overrideSelector(selectedNodeSelector, { deltas } as unknown as CodeMapNode)
        store.refreshState()
        detectChanges()
    }
})
