import "./sortingOption.component.scss"
import { SortingOption } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import {
	SortingDialogOptionService,
	SortingDialogOptionSubscriber
} from "../../state/store/dynamicSettings/sortingDialogOption/sortingDialogOption.service"
import { setSortingDialogOption } from "../../state/store/dynamicSettings/sortingDialogOption/sortingDialogOption.actions"
import _ from "lodash"

export class SortingOptionDialogController implements SortingDialogOptionSubscriber {
	private _viewModel: {
		sortingOption: SortingOption
		sortingOptions: string[]
	} = {
		sortingOption: SortingOption.NAME,
		sortingOptions: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		SortingDialogOptionService.subscribe(this.$rootScope, this)
		this._viewModel.sortingOptions = _.values(SortingOption)
	}

	public onChange() {
		this.storeService.dispatch(setSortingDialogOption(this._viewModel.sortingOption))
	}

	public onSortingDialogOptionChanged(sortingOption: SortingOption) {
		this._viewModel.sortingOption = sortingOption
	}
}

export const sortingOptionComponent = {
	selector: "sortingOptionComponent",
	template: require("./sortingOption.component.html"),
	controller: SortingOptionDialogController
}
