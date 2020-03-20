import "./sortingOptionDialog.component.scss"
import { SortingOption } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import {
	SortingDialogOptionService,
	SortingDialogOptionSubscriber
} from "../../state/store/dynamicSettings/sortingDialogOption/sortingDialogOption.service"
import { setSortingDialogOption } from "../../state/store/dynamicSettings/sortingDialogOption/sortingDialogOption.actions"

export class SortingOptionDialogController implements SortingDialogOptionSubscriber {
	private _viewModel: {
		sortingOption: SortingOption
	} = {
		sortingOption: SortingOption.Name
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		SortingDialogOptionService.subscribe(this.$rootScope, this)
	}

	public onChange() {
		this.storeService.dispatch(setSortingDialogOption(this._viewModel.sortingOption))
	}

	public enumToString() {
		return Object.keys(SortingOption)
	}

	public onSortingDialogOptionChanged(sortingDialogOption: SortingOption) {
		this._viewModel.sortingOption = sortingDialogOption
	}
}

export const sortingOptionDialogComponent = {
	selector: "sortingOptionDialogComponent",
	template: require("./sortingOptionDialog.component.html"),
	controller: SortingOptionDialogController
}
