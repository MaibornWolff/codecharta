import "./searchBar.component.scss"
import { BlacklistType } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { setSearchPattern } from "../../state/store/dynamicSettings/searchPattern/searchPattern.actions"
import _ from "lodash"
import { BlacklistService, BlacklistSubscriber } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { addBlacklistItem } from "../../state/store/fileSettings/blacklist/blacklist.actions"
import { SearchPatternService, SearchPatternSubscriber } from "../../state/store/dynamicSettings/searchPattern/searchPattern.service"
import { Blacklist } from "../../model/blacklist"

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

	public onBlacklistChanged(blacklist: Blacklist) {
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
		this._viewModel.isPatternExcluded = this.isPatternBlacklisted(BlacklistType.exclude)
		this._viewModel.isPatternHidden = this.isPatternBlacklisted(BlacklistType.flatten)
	}

	private isPatternBlacklisted(blacklistType: BlacklistType): boolean {
		return this.storeService.getState().fileSettings.blacklist.has(this._viewModel.searchPattern, blacklistType)
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
