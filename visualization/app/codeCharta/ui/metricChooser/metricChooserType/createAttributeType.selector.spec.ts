import { AttributeTypeValue } from "../../../codeCharta.model"
import { defaultState } from "../../../state/store/state.manager"
import { clone } from "../../../util/clone"
import { createAttributeTypeSelector } from "./createAttributeTypeSelector.selector"

describe("createAttributeTypeSelector", () => {
	it("should default to 'Σ'", () => {
		const attributeTypeSelector = createAttributeTypeSelector("nodes", "areaMetric")
		expect(attributeTypeSelector(defaultState)).toBe("Σ")
	})

	it("should read nodes", () => {
		const state = clone(defaultState)
		state.fileSettings.attributeTypes = { nodes: { rloc: AttributeTypeValue.relative } }
		state.dynamicSettings.areaMetric = "rloc"
		const attributeTypeSelector = createAttributeTypeSelector("nodes", "areaMetric")
		expect(attributeTypeSelector(state)).toBe("x͂")
	})

	it("should read edges", () => {
		const state = clone(defaultState)
		state.fileSettings.attributeTypes = { edges: { avgCommit: AttributeTypeValue.relative } }
		state.dynamicSettings.edgeMetric = "avgCommit"
		const attributeTypeSelector = createAttributeTypeSelector("edges", "edgeMetric")
		expect(attributeTypeSelector(state)).toBe("x͂")
	})
})
