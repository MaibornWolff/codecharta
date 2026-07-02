import { attributeTypes } from "./attributeTypes.reducer"
import { setAttributeTypes } from "./attributeTypes.actions"
import { STATE } from "../../../../mocks/dataMocks"
import { AttributeTypes } from "../../../../codeCharta.model"

describe("attributeTypes", () => {
    const defaultValue: AttributeTypes = {
        nodes: {},
        edges: {}
    }

    describe("Action: SET_ATTRIBUTE_TYPES", () => {
        it("should set new attributeTypes", () => {
            const result = attributeTypes(defaultValue, setAttributeTypes({ value: STATE.metricsLensSource.attributeTypes }))

            expect(result).toEqual(STATE.metricsLensSource.attributeTypes)
        })
    })
})
