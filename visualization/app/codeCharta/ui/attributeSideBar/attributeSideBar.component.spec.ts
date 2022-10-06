import { TestBed } from "@angular/core/testing"
import { render } from "@testing-library/angular"
import { klona } from "klona"

import { TEST_NODE_FOLDER, TEST_NODE_LEAF } from "../../util/dataMocks"
import { selectedNodeSelector } from "../../state/selectors/selectedNode.selector"
import { AttributeSideBarComponent } from "./attributeSideBar.component"
import { AttributeSideBarModule } from "./attributeSideBar.module"
import { isAttributeSideBarVisibleSelector } from "../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.selector"

jest.mock("../../state/selectors/selectedNode.selector", () => ({
	selectedNodeSelector: jest.fn()
}))
const mockedSelectedNodeSelector = selectedNodeSelector as jest.Mock

jest.mock("../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.selector", () => ({
	isAttributeSideBarVisibleSelector: jest.fn(() => true)
}))
const mockedIsAttributeSideBarVisibleSelector = isAttributeSideBarVisibleSelector as jest.Mock

jest.mock("../../state/selectors/primaryMetrics/primaryMetricNames.selector", () => ({
	primaryMetricNamesSelector: jest.fn(() => ({
		areaMetric: "a",
		heightMetric: "a",
		colorMetric: "a",
		edgeMetric: "c"
	}))
}))

describe("AttributeSideBarComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [AttributeSideBarModule]
		})
	})

	it("should display side bar if no building is selected (for opening / closing transition effect)", async () => {
		mockedSelectedNodeSelector.mockImplementationOnce(() => {})
		const { container } = await render(AttributeSideBarComponent, { excludeComponentDeclaration: true })

		expect(container.querySelector(".side-bar-container")).not.toBe(null)
	})

	it("should hide side bar if side bar is closed", async () => {
		mockedSelectedNodeSelector.mockImplementation(() => klona(TEST_NODE_LEAF))
		mockedIsAttributeSideBarVisibleSelector.mockImplementationOnce(() => false)
		const { container } = await render(AttributeSideBarComponent, { excludeComponentDeclaration: true })

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
})

function isAttributeTypeSelectorShown(container: Element) {
	return container.querySelector("cc-attribute-type-selector") !== null
}
