import { edgeAttributeTypes } from "./attributeTypes.reducer"
import { setEdgeAttributeTypes } from "./attributeTypes.actions"
import { AttributeTypes, AttributeTypeValue } from "../../../../model/codeCharta.model"

describe("edgeAttributeTypes", () => {
    const defaultValue: AttributeTypes = {
        nodes: {},
        edges: {}
    }

    describe("Action: SET_EDGE_ATTRIBUTE_TYPES", () => {
        it("should set new edge attributeTypes", () => {
            const value: AttributeTypes = { nodes: {}, edges: { pairing_rate: AttributeTypeValue.relative } }

            const result = edgeAttributeTypes(defaultValue, setEdgeAttributeTypes({ value }))

            expect(result).toEqual(value)
        })
    })
})
