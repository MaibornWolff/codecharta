import { AttributeTypesAction, AttributeTypesActions } from "./attributeTypes.actions"
import { AttributeTypes } from "../../../../codeCharta.model"
import _ from "lodash"

export function attributeTypes(state: AttributeTypes = { nodes: [], edges: [] }, action: AttributeTypesAction): AttributeTypes {
	switch (action.type) {
		case AttributeTypesActions.SET_ATTRIBUTE_TYPES:
			return _.cloneDeep(action.payload)
		default:
			return state
	}
}
