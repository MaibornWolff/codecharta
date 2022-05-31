import { _formatHoveredEdgeValue } from "./hoveredEdgeValue.selector"

describe("hoveredEdgeValueSelector", () => {
	it("should return null when there is no node hovered", () => {
		expect(_formatHoveredEdgeValue("rloc")).toBe(null)
	})

	it("should return null if hovered node has no edge attributes for given metric", () => {
		const hoveredNode = { edgeAttributes: {} }
		expect(_formatHoveredEdgeValue("rloc", hoveredNode)).toBe(null)
	})

	it("should format edge values to locale string", () => {
		const hoveredNode = { edgeAttributes: { rloc: { incoming: 3.141_59, outgoing: 2 } } }
		expect(_formatHoveredEdgeValue("rloc", hoveredNode)).toBe("3.142 / 2")
	})

	it("should format not existing values to '-'", () => {
		const hoveredNode = { edgeAttributes: { rloc: { incoming: undefined, outgoing: 2 } } }
		expect(_formatHoveredEdgeValue("rloc", hoveredNode)).toBe("- / 2")
	})
})
