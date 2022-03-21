import { _isHoveredNodeALeaf } from "./isHoveredNodeALeaf.selector"

describe("isHoveredNodeALeafSelector", () => {
	it("should not throw when there is no given node", () => {
		expect(() => _isHoveredNodeALeaf(new Map(), null)).not.toThrow()
	})

	it("should return true for hovered leaves", () => {
		expect(_isHoveredNodeALeaf(new Map([[1, { children: [] }]]), 1)).toBe(true)
	})

	it("should return false for hovered folders", () => {
		expect(_isHoveredNodeALeaf(new Map([[1, { children: [{}] }]]), 1)).toBe(false)
	})
})
