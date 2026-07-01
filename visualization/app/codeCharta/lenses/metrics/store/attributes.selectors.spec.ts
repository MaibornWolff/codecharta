import { AttributeTypeValue } from "../../../codeCharta.model"
import { nodeAttributeTypesSelector } from "./attributes.selectors"

describe("nodeAttributeTypesSelector", () => {
    it("should project the node side of the attribute types", () => {
        // Arrange
        const attributeTypes = { nodes: { rloc: AttributeTypeValue.absolute }, edges: { pairingRate: AttributeTypeValue.relative } }

        // Act
        const result = nodeAttributeTypesSelector.projector(attributeTypes)

        // Assert
        expect(result).toEqual({ rloc: AttributeTypeValue.absolute })
    })

    it("should default to an empty map when the node side is undefined", () => {
        expect(nodeAttributeTypesSelector.projector({ edges: {} })).toEqual({})
    })
})
