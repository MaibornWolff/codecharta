import { STATE } from "../../../../mocks/dataMocks"
import { AttributeTypeMap } from "../../../../model/codeCharta.model"
import { setAttributeTypes } from "./attributeTypes.actions"
import { attributeTypes } from "./attributeTypes.reducer"

describe("attributeTypes", () => {
    const defaultValue: AttributeTypeMap = {}

    describe("Action: SET_ATTRIBUTE_TYPES", () => {
        it("should set new attributeTypes", () => {
            const result = attributeTypes(defaultValue, setAttributeTypes({ value: STATE.metricsLensSource.attributeTypes }))

            expect(result).toEqual(STATE.metricsLensSource.attributeTypes)
        })
    })
})
