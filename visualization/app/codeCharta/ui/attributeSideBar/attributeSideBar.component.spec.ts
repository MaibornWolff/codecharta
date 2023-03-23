import { TestBed } from "@angular/core/testing"
import { render } from "@testing-library/angular"
import { klona } from "klona"
import { expect } from "@jest/globals"
import { TEST_NODE_FOLDER, TEST_NODE_LEAF, TEST_ATTRIBUTE_DESCRIPTORS } from "../../util/dataMocks"
import { selectedNodeSelector } from "../../state/selectors/selectedNode.selector"
import { AttributeSideBarComponent } from "./attributeSideBar.component"
import { AttributeSideBarModule } from "./attributeSideBar.module"
import { IsAttributeSideBarVisibleService } from "../../services/isAttributeSideBarVisible.service"

jest.mock("../../state/selectors/selectedNode.selector", () => ({
	selectedNodeSelector: jest.fn()
}))
const mockedSelectedNodeSelector = selectedNodeSelector as jest.Mock

const selectedMetricNames = {
	areaMetric: "a",
	heightMetric: "a",
	colorMetric: "a",
	edgeMetric: "c"
}

jest.mock("../../state/selectors/primaryMetrics/primaryMetricNames.selector", () => ({
	primaryMetricNamesSelector: jest.fn(() => selectedMetricNames)
}))

jest.mock("../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector", () => ({
	attributeDescriptorsSelector: jest.fn(() => TEST_ATTRIBUTE_DESCRIPTORS)
}))

describe("AttributeSideBarComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [AttributeSideBarModule],
			providers: [{ provide: IsAttributeSideBarVisibleService, useValue: { isOpen: true } }]
		})
	})

	it("should display side bar if no building is selected (for opening / closing transition effect)", async () => {
		mockedSelectedNodeSelector.mockImplementationOnce(() => {})
		const { container } = await render(AttributeSideBarComponent, { excludeComponentDeclaration: true })

		expect(container.querySelector(".side-bar-container")).not.toBe(null)
	})

	it("should hide side bar if side bar is closed", async () => {
		mockedSelectedNodeSelector.mockImplementation(() => klona(TEST_NODE_LEAF))
		const { container } = await render(AttributeSideBarComponent, {
			excludeComponentDeclaration: true,
			componentProviders: [{ provide: IsAttributeSideBarVisibleService, useValue: { isOpen: false } }]
		})

		expect(container.querySelector(".side-bar-container.expanded")).toBe(null)
	})

	it("should render correctly with selected building", async () => {
		mockedSelectedNodeSelector.mockImplementation(() => {
			const selectedNode = klona(TEST_NODE_LEAF)
			selectedNode.deltas = undefined
			return selectedNode
		})
		const { container } = await render(AttributeSideBarComponent, { excludeComponentDeclaration: true })

		const isSideBarOpen = container.querySelector(".side-bar-container.expanded") !== null
		expect(isSideBarOpen).toBe(true)

		const name = container.querySelector("a[class=node-link]").textContent
		expect(name).toMatch("root/big leaf.ts")

		const pathName = container.querySelector("cc-node-path").textContent
		expect(pathName).toMatch("/root/big leaf")

		const firstPrimaryMetricEntry = container.querySelector("cc-attribute-side-bar-primary-metric").textContent
		const expectedPrimaryMetricTextContent = "20 a"
		expect(firstPrimaryMetricEntry).toMatch(expectedPrimaryMetricTextContent)

		const expectedSecondaryMetricTextContent = "15b"
		const isSecondaryMetricInPrimaryMetricSection = container
			.querySelector("cc-attribute-side-bar-primary-metric")
			.textContent.includes(expectedSecondaryMetricTextContent)
		expect(isSecondaryMetricInPrimaryMetricSection).toBe(false)
		const firstSecondaryMetricEntry = container.querySelector("cc-attribute-side-bar-secondary-metrics .metric-row").textContent
		expect(firstSecondaryMetricEntry).toMatch(expectedSecondaryMetricTextContent)

		expect(isAttributeTypeSelectorShown(container)).toBe(false)
	})

	it("should display deltas if node has delta values", async () => {
		mockedSelectedNodeSelector.mockImplementation(() => klona(TEST_NODE_LEAF))
		const { container } = await render(AttributeSideBarComponent, { excludeComponentDeclaration: true })

		const firstPrimaryMetricEntry = container.querySelector("cc-attribute-side-bar-primary-metric").textContent
		const expectedPrimaryMetricTextContent = /20\s+Δ1.0\s+a/
		expect(firstPrimaryMetricEntry).toMatch(expectedPrimaryMetricTextContent)

		const expectedSecondaryMetricTextContent = /15\s+Δ2.0\s+b/
		const firstSecondaryMetricEntry = container.querySelector("cc-attribute-side-bar-secondary-metrics .metric-row").textContent
		expect(firstSecondaryMetricEntry).toMatch(expectedSecondaryMetricTextContent)
	})

	it("should display attribute type selectors for folders", async () => {
		mockedSelectedNodeSelector.mockImplementation(() => {
			const node = klona(TEST_NODE_FOLDER)
			node["children"] = [{}]
			return node
		})

		const { container } = await render(AttributeSideBarComponent, { excludeComponentDeclaration: true })

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
		mockedSelectedNodeSelector.mockImplementation(() => {
			const node = klona(TEST_NODE_FOLDER)
			node["children"] = [{}]
			return node
		})

		selectedMetricNames.edgeMetric = undefined

		const { container } = await render(AttributeSideBarComponent, { excludeComponentDeclaration: true })

		const primaryMetricsWithoutEdgeMetric = container.querySelectorAll("cc-attribute-side-bar-primary-metrics td")
		// if this turns out to be flaky, iterate through all results
		expect(primaryMetricsWithoutEdgeMetric[3].textContent === "No edge metric available")
	})

	it("should contain primary/secondary metrics with title/tooltip attribute/metric descriptor information", async () => {
		selectedMetricNames.areaMetric = "a"
		selectedMetricNames.heightMetric = "b"
		selectedMetricNames.colorMetric = "someColor"
		selectedMetricNames.edgeMetric = "someEdge"

		mockedSelectedNodeSelector.mockImplementation(() => {
			const node = klona(TEST_NODE_FOLDER)
			node["children"] = [{}]
			node["attributes"] = { a: 3, b: 1, c: 4, someColor: 10 }
			node["edgeAttributes"] = { someEdge: { incoming: 20, outgoing: 60 } }
			return node
		})

		const { container } = await render(AttributeSideBarComponent, { excludeComponentDeclaration: true })

		const attributeTypeSelectorWithinPrimaryMetrics = container.querySelectorAll("cc-attribute-side-bar-primary-metrics td")
		const attributeTypeSelectorWithinSecondaryMetrics = container.querySelectorAll(
			"cc-attribute-side-bar-secondary-metrics .metric-row"
		)

		expect(attributeTypeSelectorWithinPrimaryMetrics[0].getAttribute("title")).toBe("a_testTitle (a):\na_testDescription")
		expect(attributeTypeSelectorWithinPrimaryMetrics[1].getAttribute("title")).toBe("b_testTitle (b)")
		expect(attributeTypeSelectorWithinPrimaryMetrics[2].getAttribute("title")).toBe("someColor")
		expect(attributeTypeSelectorWithinPrimaryMetrics[3].getAttribute("title")).toBe("someEdge")

		expect(attributeTypeSelectorWithinSecondaryMetrics[0].getAttribute("title")).toBe("c:\nc_testDescription")
		expect(attributeTypeSelectorWithinSecondaryMetrics.length).toBe(1)
	})
})

function isAttributeTypeSelectorShown(container: Element) {
	return container.querySelector("cc-attribute-type-selector") !== null
}
