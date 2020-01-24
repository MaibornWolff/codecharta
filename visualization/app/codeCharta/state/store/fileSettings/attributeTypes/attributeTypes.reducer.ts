import { AttributeTypesAction, AttributeTypesActions, setAttributeTypes } from "./attributeTypes.actions"
import { AttributeTypes } from "../../../../model/codeCharta.model"
import _ from "lodash"

export function attributeTypes(state: AttributeTypes = setAttributeTypes().payload, action: AttributeTypesAction): AttributeTypes {
	switch (action.type) {
		case AttributeTypesActions.SET_ATTRIBUTE_TYPES:
			return _.cloneDeep(action.payload)
		default:
			return state
	}
}
