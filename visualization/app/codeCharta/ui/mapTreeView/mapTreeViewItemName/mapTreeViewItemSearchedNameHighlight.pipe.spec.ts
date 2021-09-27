import { MapTreeViewItemSearchedNameHighlightPipe } from "./mapTreeViewItemSearchedNameHighlight.pipe"

describe("MapTreeViewItemSearchedNameHighlightPipe", () => {
	it("should return true for searched nodes", () => {
		const searchResults = new Set<string>(["rootNode", "rootNode/childNode"])
		const nodePath = "rootNode"
		expect(new MapTreeViewItemSearchedNameHighlightPipe().transform(searchResults, nodePath)).toBeTruthy()
	})
	it("should return false for searched nodes", () => {
		const searchResults = new Set<string>(["rootNode", "rootNode/childNode"])
		const nodePath = "rootNode/childNode01"
		expect(new MapTreeViewItemSearchedNameHighlightPipe().transform(searchResults, nodePath)).toBeFalsy()
	})
})
