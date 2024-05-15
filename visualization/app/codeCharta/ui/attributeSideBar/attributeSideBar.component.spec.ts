import { TestBed } from "@angular/core/testing"
import { render } from "@testing-library/angular"
import { provideMockStore, MockStore } from "@ngrx/store/testing"
import { expect } from "@jest/globals"
import { TEST_NODE_LEAF, TEST_ATTRIBUTE_DESCRIPTORS, TEST_NODE_FOLDER } from "../../util/dataMocks"
import { selectedNodeSelector } from "../../state/selectors/selectedNode.selector"
import { AttributeSideBarComponent } from "./attributeSideBar.component"
import { AttributeSideBarModule } from "./attributeSideBar.module"
import { IsAttributeSideBarVisibleService } from "../../services/isAttributeSideBarVisible.service"
import { primaryMetricNamesSelector } from "../../state/selectors/primaryMetrics/primaryMetricNames.selector"
import { attributeDescriptorsSelector } from "../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { CodeMapNode } from "../../codeCharta.model"
import { klona } from "klona"
import { accumulatedDataSelector } from "../../state/selectors/accumulatedData/accumulatedData.selector"
import { mapColorsSelector } from "../../state/store/appSettings/mapColors/mapColors.selector"
import { defaultMapColors } from "../../state/store/appSettings/mapColors/mapColors.reducer"
import { primaryMetricsSelector } from "../../state/selectors/primaryMetrics/primaryMetrics.selector"
import { attributeTypesSelector } from "../../state/store/fileSettings/attributeTypes/attributeTypes.selector"
import { defaultAttributeTypes } from "../../state/store/fileSettings/attributeTypes/attributeTypes.reducer"
import { showAttributeTypeSelectorSelector } from "./util/showAttributeTypeSelector.selector"
import { metricTitles } from "../../util/metric/metricTitles"

let selectedMetricNames

describe("AttributeSideBarComponent", () => {
    beforeEach(() => {
        selectedMetricNames = {
            areaMetric: "a",
            heightMetric: "a",
            colorMetric: "a",
            edgeMetric: "c"
        }
        TestBed.configureTestingModule({
            imports: [AttributeSideBarModule],
            providers: [
                { provide: IsAttributeSideBarVisibleService, useValue: { isOpen: true } },
                provideMockStore({
                    selectors: [
                        { selector: primaryMetricNamesSelector, value: selectedMetricNames },
                        { selector: showAttributeTypeSelectorSelector, value: true },
                        { selector: attributeDescriptorsSelector, value: TEST_ATTRIBUTE_DESCRIPTORS },
                        { selector: attributeTypesSelector, value: defaultAttributeTypes },
                        { selector: selectedNodeSelector, value: null },
                        { selector: accumulatedDataSelector, value: {} },
                        { selector: mapColorsSelector, value: defaultMapColors },
                        { selector: primaryMetricsSelector, value: { edge: {}, color: {}, height: {}, area: {} } }
                    ]
                })
            ]
        })
    })

    it("should display side bar if no building is selected (for opening / closing transition effect)", async () => {
        const { container } = await render(AttributeSideBarComponent, { excludeComponentDeclaration: true })

        expect(container.querySelector(".side-bar-container")).not.toBe(null)
    })

    it("should hide side bar if side bar is closed", async () => {
        const { container } = await render(AttributeSideBarComponent, {
            excludeComponentDeclaration: true,
            componentProviders: [{ provide: IsAttributeSideBarVisibleService, useValue: { isOpen: false } }]
        })

        expect(container.querySelector(".side-bar-container.expanded")).toBe(null)
    })

    it("should render correctly with selected building", async () => {
        const { container, detectChanges } = await render(AttributeSideBarComponent, { excludeComponentDeclaration: true })
        const selectedNode = klona(TEST_NODE_LEAF)
        selectedNode.deltas = undefined
        mockSelectedNode(selectedNode as unknown as CodeMapNode, detectChanges)

        const isSideBarOpen = container.querySelector(".side-bar-container.expanded") !== null
        expect(isSideBarOpen).toBe(true)

        const name = container.querySelector("a[class=node-link]").textContent
        expect(name).toMatch("root/big leaf.ts")

        const pathName = container.querySelector("cc-node-path").textContent
        expect(pathName).toMatch("/root/big leaf")
    })

    it("should display attribute type selectors for folders", async () => {
        const { container, detectChanges } = await render(AttributeSideBarComponent, { excludeComponentDeclaration: true })
        const selectedNode = klona(TEST_NODE_FOLDER)
        selectedNode["children"] = [{}]
        mockSelectedNode(selectedNode as unknown as CodeMapNode, detectChanges)

        const attributeTypeSelectorWithinPrimaryMetrics = container.querySelectorAll(
            "cc-attribute-side-bar-primary-metrics cc-attribute-type-selector"
        )
        expect(attributeTypeSelectorWithinPrimaryMetrics.length).toBe(4)
        const attributeTypeSelectorWithinSecondaryMetrics = container.querySelectorAll(
            "cc-attribute-side-bar-secondary-metrics cc-attribute-type-selector"
        )
        expect(attributeTypeSelectorWithinSecondaryMetrics.length).toBe(1)
    })

    it("should contain 'no edge metric available' note", async () => {
        selectedMetricNames.edgeMetric = undefined
        const { container, detectChanges } = await render(AttributeSideBarComponent, { excludeComponentDeclaration: true })
        const selectedNode = klona(TEST_NODE_FOLDER)
        selectedNode["children"] = [{}]
        mockSelectedNode(selectedNode as unknown as CodeMapNode, detectChanges)

        const primaryMetricsWithoutEdgeMetric = container.querySelectorAll("cc-attribute-side-bar-primary-metrics td")
        expect(primaryMetricsWithoutEdgeMetric[3].textContent === "No edge metric available")
    })

    it("should contain primary/secondary metrics with title/tooltip attribute/metric descriptor information", async () => {
        selectedMetricNames.areaMetric = "a"
        selectedMetricNames.heightMetric = "b"
        selectedMetricNames.colorMetric = "mcc"
        selectedMetricNames.edgeMetric = "someEdge"

        const { container, detectChanges } = await render(AttributeSideBarComponent, { excludeComponentDeclaration: true })

        const store = TestBed.inject(MockStore)
        store.overrideSelector(primaryMetricsSelector, {
            area: { name: "a", value: 3 },
            height: { name: "b", value: 1 },
            color: {
                name: "mcc",
                value: 10
            },
            edge: {
                name: "someEdge",
                incoming: 20,
                outgoing: 60
            }
        })

        const selectedNode = klona(TEST_NODE_FOLDER)
        selectedNode["children"] = [{}]
        selectedNode["attributes"] = { a: 3, b: 1, mcc: 4, rloc: 222, someColor: 10, d: 100 }
        selectedNode["edgeAttributes"] = { someEdge: { incoming: 20, outgoing: 60 } }
        mockSelectedNode(selectedNode as unknown as CodeMapNode, detectChanges)

        const attributeTypeSelectorWithinPrimaryMetrics = container.querySelectorAll("cc-attribute-side-bar-primary-metrics td")
        const attributeTypeSelectorWithinSecondaryMetrics = container.querySelectorAll("cc-attribute-side-bar-secondary-metrics tr")
        expect(attributeTypeSelectorWithinPrimaryMetrics[0].getAttribute("title")).toBe("a_testTitle (a):\na_testDescription")
        expect(attributeTypeSelectorWithinPrimaryMetrics[1].getAttribute("title")).toBe("b_testTitle (b)")
        expect(attributeTypeSelectorWithinPrimaryMetrics[1].querySelector("a").getAttribute("href")).toBe("https://test.link")
        expect(attributeTypeSelectorWithinPrimaryMetrics[2].getAttribute("title")).toBe(metricTitles.get("mcc"))
        expect(attributeTypeSelectorWithinPrimaryMetrics[3].getAttribute("title")).toBe("")

        expect(attributeTypeSelectorWithinSecondaryMetrics[1].querySelector("a").getAttribute("href")).toBe("https://test2.link")
        expect(attributeTypeSelectorWithinSecondaryMetrics[1].getAttribute("title")).toBe("d")
        expect(attributeTypeSelectorWithinSecondaryMetrics[2].getAttribute("title")).toBe(metricTitles.get("rloc"))
        expect(attributeTypeSelectorWithinSecondaryMetrics[3].getAttribute("title")).toBe("") // someColor
        expect(attributeTypeSelectorWithinSecondaryMetrics.length).toBe(4) // header + three entries
    })
})

function mockSelectedNode(node: CodeMapNode, detectChanges: () => void) {
    const store = TestBed.inject(MockStore)
    store.overrideSelector(selectedNodeSelector, node)
    store.refreshState()
    detectChanges()
}
