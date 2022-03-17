import { SortingOption } from "../../../../codeCharta.model"
import { sortingOrderSelector } from "../../../../state/store/dynamicSettings/sortingOption/sortingOrder.selector"
import { Store } from "../../../../state/store/store"
import { mapTreeViewNodeSelector } from "./mapTreeViewNode.selector"

jest.mock("../../../../state/selectors/accumulatedData/accumulatedData.selector", () => ({
	accumulatedDataSelector: () => ({
		// freeze to make sure it is not modified. We cannot test for modification, as jest always returns the untouched mock, but due to this freeze, we would get a JS runtime error leading to a test failure,
		unifiedMapNode: Object.freeze({
			name: "root",
			children: [
				{
					name: "folder1",
					type: "Folder",
					attributes: { unary: 1 },
					children: [] // there should be one child in it to match its unary value but don't care for this test
				},
				{
					name: "folder2",
					type: "Folder",
					attributes: { unary: 2 },
					children: [] // there should be two children in it to match its unary value but don't care for this test
				},
				{ name: "a", type: "File", attributes: {} },
				{ name: "b", type: "File", attributes: {} }
			]
		})
	})
}))
jest.mock("../../../../state/store/dynamicSettings/sortingOption/sortingOrder.selector", () => {
	const realSelector = jest.requireActual(
		"../../../../state/store/dynamicSettings/sortingOption/sortingOrder.selector"
	).sortingOrderSelector
	return {
		sortingOrderSelector: jest.fn().mockImplementation(realSelector)
	}
})

describe("mapTreeViewNodeSelector", () => {
	it("should sort default to ascending by name", () => {
		const mapTreeViewNode = mapTreeViewNodeSelector(Store.store.getState())
		expect(mapTreeViewNode.children[0].name).toBe("folder1")
		expect(mapTreeViewNode.children[1].name).toBe("folder2")
		expect(mapTreeViewNode.children[2].name).toBe("a")
		expect(mapTreeViewNode.children[3].name).toBe("b")
	})

	it("should sort folder ascending by unary value, meaning most children first", () => {
		sortingOrderSelector["mockImplementationOnce"](() => SortingOption.NUMBER_OF_FILES)
		const mapTreeViewNode = mapTreeViewNodeSelector(Store.store.getState())
		expect(mapTreeViewNode.children[0].name).toBe("folder1")
		expect(mapTreeViewNode.children[1].name).toBe("folder2")
	})
})
