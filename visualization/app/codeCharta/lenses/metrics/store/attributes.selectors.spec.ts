import { STATE } from "../../../mocks/dataMocks"
import { nodeAttributeTypesSelector } from "./attributes.selectors"

describe("nodeAttributeTypesSelector", () => {
    it("should select the node attribute types of the metrics lens source", () => {
        // Arrange
        const state = STATE

        // Act
        const result = nodeAttributeTypesSelector(state)

        // Assert
        expect(result).toEqual(STATE.metricsLensSource.attributeTypes)
    })
})
