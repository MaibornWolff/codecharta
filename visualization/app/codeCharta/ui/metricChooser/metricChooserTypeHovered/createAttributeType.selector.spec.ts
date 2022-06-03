import { AttributeTypeValue } from "../../../codeCharta.model"
import { setAreaMetric } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { setEdgeMetric } from "../../../state/store/dynamicSettings/edgeMetric/edgeMetric.actions"
import { setAttributeTypes } from "../../../state/store/fileSettings/attributeTypes/attributeTypes.actions"
import { Store } from "../../../state/store/store"
import { createAttributeTypeSelector } from "./createAttributeTypeSelector.selector"

describe("createAttributeTypeSelector", () => {
	beforeEach(() => {
		Store["initialize"]()
	})

	it("should default to 'Σ'", () => {
		const attributeTypeSelector = createAttributeTypeSelector("nodes", "areaMetric")
		expect(attributeTypeSelector(Store.store.getState())).toBe("Σ")
	})

	it("should read nodes", () => {
		Store.store.dispatch(setAttributeTypes({ nodes: { rloc: AttributeTypeValue.relative } }))
		Store.store.dispatch(setAreaMetric("rloc"))
		const attributeTypeSelector = createAttributeTypeSelector("nodes", "areaMetric")
		expect(attributeTypeSelector(Store.store.getState())).toBe("x͂")
	})

	it("should read edges", () => {
		Store.store.dispatch(setAttributeTypes({ edges: { avgCommit: AttributeTypeValue.relative } }))
		Store.store.dispatch(setEdgeMetric("avgCommit"))
		const attributeTypeSelector = createAttributeTypeSelector("edges", "edgeMetric")
		expect(attributeTypeSelector(Store.store.getState())).toBe("x͂")
	})
})
