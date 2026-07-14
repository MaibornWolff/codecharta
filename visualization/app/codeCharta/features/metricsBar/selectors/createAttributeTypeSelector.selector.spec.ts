import { AttributeTypeValue } from "../../../model/codeCharta.model"
import { defaultState } from "../../../stores/rootStore/state.manager"
import { clone } from "../../../util/clone"
import { createAttributeTypeSelector } from "./createAttributeTypeSelector.selector"

describe("createAttributeTypeSelector", () => {
    it("should default to 'Σ'", () => {
        const attributeTypeSelector = createAttributeTypeSelector("nodes", "areaMetric")
        expect(attributeTypeSelector(defaultState)).toBe("Σ")
    })

    it("should read nodes", () => {
        const state = clone(defaultState)
        state.metricsLensSource.attributeTypes = { rloc: AttributeTypeValue.relative }
        state.mapState.areaMetric = "rloc"
        const attributeTypeSelector = createAttributeTypeSelector("nodes", "areaMetric")
        expect(attributeTypeSelector(state)).toBe("x͂")
    })

    it("should read edges", () => {
        const state = clone(defaultState)
        state.dependencyLensSource.attributeTypes = { avgCommit: AttributeTypeValue.relative }
        state.mapState.edgeMetric = "avgCommit"
        const attributeTypeSelector = createAttributeTypeSelector("edges", "edgeMetric")
        expect(attributeTypeSelector(state)).toBe("x͂")
    })
})
