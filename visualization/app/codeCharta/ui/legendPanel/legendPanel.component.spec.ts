import { TestBed } from "@angular/core/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import { expect } from "@jest/globals"
import { isDeltaStateSelector } from "../../state/selectors/isDeltaState.selector"
import { LegendPanelComponent } from "./legendPanel.component"
import { LegendPanelModule } from "./legendPanel.module"
import { IsAttributeSideBarVisibleService } from "../../services/isAttributeSideBarVisible.service"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { heightMetricSelector } from "../../state/store/dynamicSettings/heightMetric/heightMetric.selector"
import { areaMetricSelector } from "../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { colorMetricSelector } from "../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { colorRangeSelector } from "../../state/store/dynamicSettings/colorRange/colorRange.selector"
import { State } from "@ngrx/store"
import { mapColorsSelector } from "../../state/store/appSettings/mapColors/mapColors.selector"
import { defaultMapColors } from "../../state/store/appSettings/mapColors/mapColors.reducer"
import { selectedColorMetricDataSelector } from "../../state/selectors/accumulatedData/metricData/selectedColorMetricData.selector"
import { attributeDescriptorsSelector } from "../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"

describe("LegendPanelController", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [LegendPanelModule],
            providers: [
                provideMockStore({
                    selectors: [
                        { selector: heightMetricSelector, value: "mcc" },
                        { selector: areaMetricSelector, value: "loc" },
                        { selector: colorMetricSelector, value: "rloc" },
                        { selector: colorRangeSelector, value: { from: 21, to: 42, max: 9001 } },
                        { selector: isDeltaStateSelector, value: true },
                        { selector: mapColorsSelector, value: defaultMapColors },
                        { selector: selectedColorMetricDataSelector, value: {} },
                        { selector: attributeDescriptorsSelector, value: {} }
                    ]
                }),
                { provide: State, useValue: {} }
            ]
        })
    })

    it("should open and close", async () => {
        const { container } = await render(LegendPanelComponent, { excludeComponentDeclaration: true })

        expect(isLegendPanelOpen(container)).toBe(false)

        const openLegendButton = screen.getByTitle("Show panel")
        fireEvent.click(openLegendButton)
        expect(isLegendPanelOpen(container)).toBe(true)

        const closeLegendButton = screen.getByTitle("Hide panel")
        fireEvent.click(closeLegendButton)
        expect(isLegendPanelOpen(container)).toBe(false)
    })

    it("should display legend for single mode", async () => {
        const { container, detectChanges } = await render(LegendPanelComponent, { excludeComponentDeclaration: true })
        const store = TestBed.inject(MockStore)
        store.overrideSelector(isDeltaStateSelector, false)
        store.refreshState()
        detectChanges()
        fireEvent.click(screen.getByTitle("Show panel"))

        expect(screen.queryAllByText("delta", { exact: false }).length).not.toBeGreaterThan(0)

        const metricDescriptions = container.querySelectorAll("cc-legend-block")
        expect(metricDescriptions[0].textContent).toMatch("Area metric: Lines of Code (loc)")
        expect(metricDescriptions[1].textContent).toMatch("Height metric: Cyclomatic Complexity (mcc)")
        expect(metricDescriptions[2].textContent).toMatch("Color metric: Real Lines of Code (rloc)")
    })

    it("should contain elements with titles and links if attributeDescriptors are present", async () => {
        const { container, detectChanges } = await render(LegendPanelComponent, { excludeComponentDeclaration: true })
        const store = TestBed.inject(MockStore)
        const metricLink = "https://rl.oc"
        store.overrideSelector(isDeltaStateSelector, false)
        const mccAttributeDescriptor = {
            mcc: { title: "MCC_Title", description: "MCC_description", hintLowValue: "MCC_lowValue", hintHighValue: "", link: "" }
        }
        store.overrideSelector(attributeDescriptorsSelector, {
            ...mccAttributeDescriptor,
            rloc: { title: "RLOC_Title", description: "RLOC_Description", hintLowValue: "", hintHighValue: "", link: metricLink }
        })
        store.refreshState()
        detectChanges()
        fireEvent.click(screen.getByTitle("Show panel"))
        expect(screen.queryAllByText("delta", { exact: false }).length).not.toBeGreaterThan(0)

        const metricDescriptions = container.querySelectorAll("cc-legend-block")
        expect(metricDescriptions[0].textContent).toMatch("Area metric: Lines of Code (loc)")
        expect(metricDescriptions[1].textContent).toMatch("Height metric: MCC_Title (mcc)")
        expect(metricDescriptions[1].firstElementChild.getAttribute("title")).toMatch(
            "MCC_Title (mcc):\nMCC_description\nLow Values: MCC_lowValue"
        )
        expect(metricDescriptions[1].querySelector("a")).toBeNull()
        expect(metricDescriptions[2].textContent).toMatch("Color metric: RLOC_Title (rloc)")
        expect(metricDescriptions[2].firstElementChild.getAttribute("title")).toMatch("RLOC_Title (rloc)")
        expect(metricDescriptions[2].querySelector("a").getAttribute("href")).toMatch(metricLink)
    })

    it("should display legend for delta mode", async () => {
        const { container } = await render(LegendPanelComponent, { excludeComponentDeclaration: true })
        fireEvent.click(screen.getByTitle("Show panel"))

        expect(screen.queryAllByText("delta", { exact: false }).length).toBeGreaterThan(0)

        const metricDescriptions = container.querySelectorAll("cc-legend-block")
        expect(metricDescriptions.length).toBe(0)
    })

    it("should add class 'isAttributeSideBarVisible' to opening button, when attribute sidebar is open", async () => {
        const { container } = await render(LegendPanelComponent, {
            excludeComponentDeclaration: true,
            componentProviders: [{ provide: IsAttributeSideBarVisibleService, useValue: { isOpen: true } }]
        })
        const openingButton = container.querySelector(".panel-button")
        expect(openingButton.classList).toContain("isAttributeSideBarVisible")
    })
})

function isLegendPanelOpen(container: Element) {
    return container.querySelector(".block-wrapper").classList.contains("visible")
}
