import { render } from "@testing-library/angular"
import { isHoveredNodeALeafSelector } from "./isHoveredNodeALeaf.selector"
import { MetricChooserTypeHoveredComponent } from "./metricChooserTypeHovered.component"

jest.mock("./isHoveredNodeALeaf.selector", () => ({
	isHoveredNodeALeafSelector: jest.fn()
}))
const mockedIsHoveredNodeALeafSelector = jest.mocked(isHoveredNodeALeafSelector)

describe("metricChooserTypeHovered", () => {
	it("should be hidden, when hovered node is a leaf", async () => {
		mockedIsHoveredNodeALeafSelector.mockImplementation(() => true)
		const { container } = await render(MetricChooserTypeHoveredComponent)

		expect(container.querySelector("span").hidden).toBe(true)
	})

	it("should not be hidden, when hovered node is a folder", async () => {
		mockedIsHoveredNodeALeafSelector.mockImplementation(() => false)
		const { container } = await render(MetricChooserTypeHoveredComponent)

		expect(container.querySelector("span").hidden).toBe(false)
	})
})
