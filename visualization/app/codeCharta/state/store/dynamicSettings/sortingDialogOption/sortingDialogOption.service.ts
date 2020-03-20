import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { SortingDialogOptionActions } from "./sortingDialogOption.actions"
import _ from "lodash"
import { SortingOption } from "../../../../codeCharta.model"

export interface SortingDialogOptionSubscriber {
	onSortingDialogOptionChanged(sortingDialogOption: SortingOption)
}

export class SortingDialogOptionService implements StoreSubscriber {
	private static SORTING_DIALOG_OPTION_CHANGED_EVENT = "sorting-dialog-option-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(SortingDialogOptionActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().dynamicSettings.sortingDialogOption
	}

	private notify(newState: SortingOption) {
		this.$rootScope.$broadcast(SortingDialogOptionService.SORTING_DIALOG_OPTION_CHANGED_EVENT, { sortingDialogOption: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: SortingDialogOptionSubscriber) {
		$rootScope.$on(SortingDialogOptionService.SORTING_DIALOG_OPTION_CHANGED_EVENT, (event, data) => {
			subscriber.onSortingDialogOptionChanged(data.sortingDialogOption)
		})
	}
}
