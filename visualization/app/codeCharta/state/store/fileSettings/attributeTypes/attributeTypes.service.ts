import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { AttributeTypesActions, setAttributeTypes } from "./attributeTypes.actions"
import _ from "lodash"
import { getMergedAttributeTypes } from "./attributeTypes.merger"
import { Files } from "../../../../model/files"
import { FilesService, FilesSelectionSubscriber } from "../../files/files.service"
import { AttributeTypes } from "../../../../codeCharta.model"

export interface AttributeTypesSubscriber {
	onAttributeTypesChanged(attributeTypes: AttributeTypes)
}

export class AttributeTypesService implements StoreSubscriber, FilesSelectionSubscriber {
	private static ATTRIBUTE_TYPES_CHANGED_EVENT = "attribute-types-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(AttributeTypesActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	public onFilesSelectionChanged(files: Files) {
		this.merge(files)
	}

	private merge(files: Files) {
		const allAttributeTypes: AttributeTypes[] = files
			.getVisibleFileStates()
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
