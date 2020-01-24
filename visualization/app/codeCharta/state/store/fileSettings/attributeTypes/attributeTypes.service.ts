import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { AttributeTypesActions } from "./attributeTypes.actions"
import _ from "lodash"
import { AttributeTypes } from "../../../../model/codeCharta.model"

export interface AttributeTypesSubscriber {
	onAttributeTypesChanged(attributeTypes: AttributeTypes)
}

export class AttributeTypesService implements StoreSubscriber {
	private static ATTRIBUTE_TYPES_CHANGED_EVENT = "attribute-types-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe($rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(AttributeTypesActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().fileSettings.attributeTypes
	}

	private notify(newState: AttributeTypes) {
		this.$rootScope.$broadcast(AttributeTypesService.ATTRIBUTE_TYPES_CHANGED_EVENT, { attributeTypes: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: AttributeTypesSubscriber) {
		$rootScope.$on(AttributeTypesService.ATTRIBUTE_TYPES_CHANGED_EVENT, (event, data) => {
			subscriber.onAttributeTypesChanged(data.attributeTypes)
		})
	}
}
