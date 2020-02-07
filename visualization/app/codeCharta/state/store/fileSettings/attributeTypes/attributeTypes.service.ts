import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { AttributeTypesActions, setAttributeTypes } from "./attributeTypes.actions"
import _ from "lodash"
import { AttributeTypes, FileState } from "../../../../codeCharta.model"
import { getMergedAttributeTypes } from "./attributeTypes.merger"
import { FileStateHelper } from "../../../../util/fileStateHelper"
import { FileStateService, FileStateSubscriber } from "../../../fileState.service"

export interface AttributeTypesSubscriber {
	onAttributeTypesChanged(attributeTypes: AttributeTypes)
}

export class AttributeTypesService implements StoreSubscriber, FileStateSubscriber {
	private static ATTRIBUTE_TYPES_CHANGED_EVENT = "attribute-types-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		FileStateService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(AttributeTypesActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	public onFileStatesChanged(fileStates: FileState[]) {
		this.merge(fileStates)
	}

	public merge(fileStates: FileState[]) {
		const allAttributeTypes: AttributeTypes[] = FileStateHelper.getVisibleFileStates(fileStates)
			.map(x => x.file)
			.map(x => x.settings.fileSettings.attributeTypes)

		const newAttributeTypes = getMergedAttributeTypes(allAttributeTypes)
		this.storeService.dispatch(setAttributeTypes(newAttributeTypes))
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
