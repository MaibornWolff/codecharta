import { render } from "@testing-library/angular"
import { mocked } from "ts-jest/utils"
import { isHoveredNodeALeafSelector } from "./isHoveredNodeALeaf.selector"
import { MetricTypeHoveredComponent } from "./metricTypeHovered.component"

jest.mock("./isHoveredNodeALeaf.selector", () => ({
	isHoveredNodeALeafSelector: jest.fn()
}))
const mockedIsHoveredNodeALeafSelector = mocked(isHoveredNodeALeafSelector)

describe("metricTypeHoveredComponent", () => {
	it("should be hidden, when hovered node is a leaf", async () => {
		mockedIsHoveredNodeALeafSelector.mockImplementation(() => true)
		const { container } = await render(MetricTypeHoveredComponent)

		expect(container.querySelector("span").hidden).toBe(true)
	})

	it("should not be hidden, when hovered node is a folder", async () => {
		mockedIsHoveredNodeALeafSelector.mockImplementation(() => false)
		const { container } = await render(MetricTypeHoveredComponent)

		expect(container.querySelector("span").hidden).toBe(false)
	})
})
