import { TestBed } from "@angular/core/testing"
import { render, screen, waitFor } from "@testing-library/angular"
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
import { ViewContainerRef } from "@angular/core"
import userEvent from "@testing-library/user-event"
import { edgeMetricSelector } from "../../state/store/dynamicSettings/edgeMetric/edgeMetric.selector"
import { legendMarkedPackagesSelector } from "./legendMarkedPackages/legendMarkedPackages.selector"

const selectors = [
    { selector: heightMetricSelector, value: "sonar_complexity" },
    { selector: areaMetricSelector, value: "loc" },
    { selector: colorMetricSelector, value: "rloc" },
    { selector: edgeMetricSelector, value: "rloc" },
    { selector: colorRangeSelector, value: { from: 21, to: 42, max: 9001 } },
    { selector: isDeltaStateSelector, value: true },
    { selector: mapColorsSelector, value: defaultMapColors },
    { selector: selectedColorMetricDataSelector, value: {} },
    { selector: attributeDescriptorsSelector, value: {} },
    { selector: legendMarkedPackagesSelector, value: {} }
]

describe(LegendPanelComponent.name, () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [LegendPanelModule],
            providers: [provideMockStore({ selectors }), { provide: State, useValue: {} }, ViewContainerRef]
        })
    })

    it("should open and close", async () => {
        const { container, fixture } = await render(LegendPanelComponent, { excludeComponentDeclaration: true })

        expect(isLegendPanelOpen(container)).toBe(false)

        const openLegendButton = screen.getByTitle("Show panel")
        await userEvent.click(openLegendButton)
        fixture.detectChanges()
        await waitFor(() => expect(isLegendPanelOpen(container)).toBe(true))

        const closeLegendButton = screen.getByTitle("Hide panel")
        await userEvent.click(closeLegendButton)
        fixture.detectChanges()
        await waitFor(() => expect(isLegendPanelOpen(container)).toBe(false))
    })

    it("should display legend for single mode", async () => {
        const { container, detectChanges } = await render(LegendPanelComponent, { excludeComponentDeclaration: true })
        const store = TestBed.inject(MockStore)
        store.overrideSelector(isDeltaStateSelector, false)
        store.refreshState()
        detectChanges()
        await userEvent.click(screen.getByTitle("Show panel"))

        expect(screen.queryAllByText("delta", { exact: false }).length).not.toBeGreaterThan(0)

        const metricDescriptions = container.querySelectorAll("cc-legend-block")
        expect(metricDescriptions[0].textContent).toMatch("Area metric: Lines of Code (loc)")
        expect(metricDescriptions[1].textContent).toMatch("Height metric: Cyclomatic Complexity (sonar_complexity)")
        expect(metricDescriptions[2].textContent).toMatch("Edge metric: Real Lines of Code (rloc)")
        expect(metricDescriptions[3].textContent).toMatch("Color metric: Real Lines of Code (rloc)")
    })

    it("should contain elements with titles and links if attributeDescriptors are present", async () => {
        const { container, detectChanges } = await render(LegendPanelComponent, { excludeComponentDeclaration: true })
        const store = TestBed.inject(MockStore)
        const metricLink = "https://rl.oc"
        store.overrideSelector(isDeltaStateSelector, false)
        const complexityAttributeDescriptor = {
            sonar_complexity: {
                title: "COMPLEXITY_Title",
                description: "COMPLEXITY_description",
                hintLowValue: "COMPLEXITY_lowValue",
                hintHighValue: "",
                link: ""
            }
        }
        store.overrideSelector(attributeDescriptorsSelector, {
            ...complexityAttributeDescriptor,
            rloc: { title: "RLOC_Title", description: "RLOC_Description", hintLowValue: "", hintHighValue: "", link: metricLink }
        })
        store.refreshState()
        detectChanges()
        await userEvent.click(screen.getByTitle("Show panel"))
        expect(screen.queryAllByText("delta", { exact: false }).length).not.toBeGreaterThan(0)

        const metricDescriptions = container.querySelectorAll("cc-legend-block")
        expect(metricDescriptions[0].textContent).toMatch("Area metric: Lines of Code (loc)")
        expect(metricDescriptions[1].textContent).toMatch("Height metric: COMPLEXITY_Title (sonar_complexity)")
        expect(metricDescriptions[1].firstElementChild.getAttribute("title")).toMatch(
            "COMPLEXITY_Title (sonar_complexity):\nCOMPLEXITY_description\nLow Values: COMPLEXITY_lowValue"
        )
        expect(metricDescriptions[1].querySelector("a")).toBeNull()
        expect(metricDescriptions[2].textContent).toMatch("Edge metric: RLOC_Title (rloc)")
        expect(metricDescriptions[2].firstElementChild.getAttribute("title")).toMatch("RLOC_Title (rloc)")
        expect(metricDescriptions[2].querySelector("a").getAttribute("href")).toMatch(metricLink)
        expect(metricDescriptions[3].textContent).toMatch("Color metric: RLOC_Title (rloc)")
        expect(metricDescriptions[3].firstElementChild.getAttribute("title")).toMatch("RLOC_Title (rloc)")
        expect(metricDescriptions[3].querySelector("a").getAttribute("href")).toMatch(metricLink)
    })

    it("should display legend for delta mode", async () => {
        const { container } = await render(LegendPanelComponent, { excludeComponentDeclaration: true })
        await userEvent.click(screen.getByTitle("Show panel"))

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

    describe("closing on outside clicks", () => {
        it("should subscribe to mousedown events when opening", async () => {
            const addEventListenerSpy = jest.spyOn(document, "addEventListener")
            const { fixture } = await render(LegendPanelComponent, { excludeComponentDeclaration: true })
            fixture.componentInstance.ngOnInit()
            expect(addEventListenerSpy).toHaveBeenCalledWith("mousedown", expect.any(Function))
        })

        it("should unsubscribe mousedown events when destroyed", async () => {
            const removeEventListenerSpy = jest.spyOn(document, "removeEventListener")
            const { fixture } = await render(LegendPanelComponent, { excludeComponentDeclaration: true })
            fixture.componentInstance.ngOnInit()
            fixture.componentInstance.ngOnDestroy()
            expect(removeEventListenerSpy).toHaveBeenCalledWith("mousedown", expect.any(Function))
        })

        it("should close on outside clicks", async () => {
            const { container, fixture } = await render(LegendPanelComponent, { excludeComponentDeclaration: true })
            expect(isLegendPanelOpen(container)).toBe(false)

            const openLegendButton = screen.getByTitle("Show panel")
            await userEvent.click(openLegendButton)
            fixture.detectChanges()
            expect(isLegendPanelOpen(container)).toBe(true)

            await userEvent.click(document.body)
            fixture.detectChanges()
            expect(isLegendPanelOpen(container)).toBe(false)
        })

        it("should not close when clicking inside", async () => {
            const { container, fixture } = await render(`<cc-legend-panel></cc-legend-panel>`, {
                excludeComponentDeclaration: true
            })
            const panel = container.querySelector("cc-legend-panel")
            expect(isLegendPanelOpen(container)).toBe(false)

            const openLegendButton = screen.getByTitle("Show panel")
            await userEvent.click(openLegendButton)
            fixture.detectChanges()
            expect(isLegendPanelOpen(container)).toBe(true)

            await userEvent.click(panel)
            fixture.detectChanges()
            expect(isLegendPanelOpen(container)).toBe(true)
        })
    })
})

function isLegendPanelOpen(container: Element) {
    return container.querySelector("#legend-panel").classList.contains("visible")
}
