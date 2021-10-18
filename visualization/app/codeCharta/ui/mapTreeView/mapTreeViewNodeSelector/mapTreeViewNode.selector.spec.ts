import { accumulatedDataSelector } from "../../../state/selectors/accumulatedData/accumulatedData.selector"
import { Store } from "../../../state/store/store"
import { mapTreeViewNodeSelector } from "./mapTreeViewNode.selector"

jest.mock("../../../state/selectors/accumulatedData/accumulatedData.selector", () => ({
	accumulatedDataSelector: () => ({
		unifiedMapNode: Object.freeze({
			name: "root",
			children: [
				{ name: "a", type: "File" },
				{ name: "b", type: "File" }
			]
		})
	})
}))

describe("mapTreeViewNodeSelector", () => {
	it("should sort default to descending by name", () => {
		const mapTreeViewNode = mapTreeViewNodeSelector(Store.store.getState())
		expect(mapTreeViewNode.children[0].name).toBe("b")
		expect(mapTreeViewNode.children[1].name).toBe("a")
	})

	it("should clone given node, as the sorting is done inplace", () => {
		const state = Store.store.getState()
		const mapTreeViewNode = mapTreeViewNodeSelector(state)
		expect(mapTreeViewNode).not.toEqual(accumulatedDataSelector(state))
	})
})
