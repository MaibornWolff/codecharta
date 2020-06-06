import "./sortingOption.component.scss"
import { SortingOption } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { setSortingOption } from "../../state/store/dynamicSettings/sortingOption/sortingOption.actions"
import _ from "lodash"
import {
	SortingOptionService,
	SortingOptionSubscriber
} from "../../state/store/dynamicSettings/sortingOption/sortingOption.service"

export class SortingOptionController implements SortingOptionSubscriber {
	private _viewModel: {
		sortingOption: SortingOption
		sortingOptions: string[]
	} = {
		sortingOption: SortingOption.NAME,
		sortingOptions: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		SortingOptionService.subscribe(this.$rootScope, this)
		this._viewModel.sortingOptions = _.values(SortingOption)
	}

	public onSortingOptionChanged(sortingOption: SortingOption) {
		this._viewModel.sortingOption = sortingOption
	}

	public onChange() {
		this.storeService.dispatch(setSortingOption(this._viewModel.sortingOption))
	}
}

export const sortingOptionComponent = {
	selector: "sortingOptionComponent",
	template: require("./sortingOption.component.html"),
	controller: SortingOptionController
}
