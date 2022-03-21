import { render } from "@testing-library/angular"
import { mocked } from "ts-jest/utils"
import { isHoveredNodeALeafSelector } from "./isHoveredNodeALeaf.selector"
import { MetricTypeComponent } from "./metricType.component"

jest.mock("./isHoveredNodeALeaf.selector", () => ({
	isHoveredNodeALeafSelector: jest.fn()
}))
const mockedIsHoveredNodeALeafSelector = mocked(isHoveredNodeALeafSelector)

describe("metricTypeComponent", () => {
	it("should be hidden, when hovered node is a leaf", async () => {
		mockedIsHoveredNodeALeafSelector.mockImplementation(() => true)
		const { container } = await render(MetricTypeComponent)

		expect(container.querySelector("span").hidden).toBe(true)
	})

	it("should not be hidden, when hovered node is a folder", async () => {
		mockedIsHoveredNodeALeafSelector.mockImplementation(() => false)
		const { container } = await render(MetricTypeComponent)

		expect(container.querySelector("span").hidden).toBe(false)
	})
})
