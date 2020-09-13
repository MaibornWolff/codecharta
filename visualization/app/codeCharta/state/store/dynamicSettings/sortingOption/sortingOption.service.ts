import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { SortingOptionActions } from "./sortingOption.actions"
import { isActionOfType } from "../../../../util/reduxHelper"
import { SortingOption } from "../../../../codeCharta.model"

export interface SortingOptionSubscriber {
	onSortingOptionChanged(sortingOption: SortingOption)
}

export class SortingOptionService implements StoreSubscriber {
	private static SORTING_OPTION_CHANGED_EVENT = "sorting-option-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, SortingOptionActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().dynamicSettings.sortingOption
	}

	private notify(newState: SortingOption) {
		this.$rootScope.$broadcast(SortingOptionService.SORTING_OPTION_CHANGED_EVENT, { sortingOption: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: SortingOptionSubscriber) {
		$rootScope.$on(SortingOptionService.SORTING_OPTION_CHANGED_EVENT, (_event_, data) => {
			subscriber.onSortingOptionChanged(data.sortingOption)
		})
	}
}
