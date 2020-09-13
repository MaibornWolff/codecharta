import "./searchBar.component.scss"
import { BlacklistType, BlacklistItem } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { setSearchPattern } from "../../state/store/dynamicSettings/searchPattern/searchPattern.actions"
import _ from "lodash"
import { BlacklistService, BlacklistSubscriber } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { addBlacklistItem } from "../../state/store/fileSettings/blacklist/blacklist.actions"
import { SearchPatternService, SearchPatternSubscriber } from "../../state/store/dynamicSettings/searchPattern/searchPattern.service"

export class SearchBarController implements BlacklistSubscriber, SearchPatternSubscriber {
	private static DEBOUNCE_TIME = 400
	private readonly applyDebouncedSearchPattern: () => void

	private _viewModel: {
		searchPattern: string
		isPatternHidden: boolean
		isPatternExcluded: boolean
	} = {
		searchPattern: "",
		isPatternHidden: true,
		isPatternExcluded: true
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		BlacklistService.subscribe(this.$rootScope, this)
		SearchPatternService.subscribe(this.$rootScope, this)
		this.applyDebouncedSearchPattern = _.debounce(() => {
			this.updateSearchPattern()
		}, SearchBarController.DEBOUNCE_TIME)
	}

	public onBlacklistChanged() {
		this.updateViewModel()
	}

	public onSearchPatternChanged(searchPattern: string) {
		this._viewModel.searchPattern = searchPattern
		this.updateViewModel()
	}

	public handleSearchPatternChange() {
		this.applyDebouncedSearchPattern()
	}

	public onClickBlacklistPattern(blacklistType: BlacklistType) {
		this.storeService.dispatch(addBlacklistItem({ path: this._viewModel.searchPattern, type: blacklistType }))
		this.resetSearchPattern()
	}

	public isSearchPatternEmpty() {
		return this._viewModel.searchPattern === ""
	}

	private updateViewModel() {
		const { blacklist } = this.storeService.getState().fileSettings
		this._viewModel.isPatternExcluded = this.isPatternBlacklisted(blacklist, BlacklistType.exclude)
		this._viewModel.isPatternHidden = this.isPatternBlacklisted(blacklist, BlacklistType.flatten)
	}

	private isPatternBlacklisted(blacklist: BlacklistItem[], blacklistType: BlacklistType) {
		return blacklist.some(x => this._viewModel.searchPattern === x.path && blacklistType === x.type)
	}

	private resetSearchPattern() {
		this._viewModel.searchPattern = ""
		this.updateSearchPattern()
	}

	private updateSearchPattern() {
		this.storeService.dispatch(setSearchPattern(this._viewModel.searchPattern))
	}
}

export const searchBarComponent = {
	selector: "searchBarComponent",
	template: require("./searchBar.component.html"),
	controller: SearchBarController
}
