import { _isHoveredNodeALeaf } from "./isNodeALeaf.selector"

describe("isHoveredNodeALeafSelector", () => {
	it("should not throw when there is no given node", () => {
		expect(() => _isHoveredNodeALeaf(undefined)).not.toThrow()
	})

	it("should return true for hovered leaves", () => {
		expect(_isHoveredNodeALeaf({ children: [] })).toBe(true)
	})

	it("should return false for hovered folders", () => {
		expect(_isHoveredNodeALeaf({ children: [{}] })).toBe(false)
	})
})
