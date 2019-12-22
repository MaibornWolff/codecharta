import "./searchBar.component.scss"
import { BlacklistType, BlacklistItem, FileState } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { FileStateService, FileStateServiceSubscriber } from "../../state/fileState.service"
import { StoreService } from "../../state/store.service"
import { setSearchPattern } from "../../state/store/dynamicSettings/searchPattern/searchPattern.actions"
import _ from "lodash"
import { BlacklistService, BlacklistSubscriber } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { addBlacklistItem } from "../../state/store/fileSettings/blacklist/blacklist.actions"

export class SearchBarController implements BlacklistSubscriber, FileStateServiceSubscriber {
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
		FileStateService.subscribe(this.$rootScope, this)
		this.applyDebouncedSearchPattern = _.debounce(() => {
			this.applySettingsSearchPattern()
		}, SearchBarController.DEBOUNCE_TIME)
	}

	public onFileSelectionStatesChanged(fileStates: FileState[]) {
		this.resetSearchPattern()
	}

	public onImportedFilesChanged(fileStates: FileState[]) {}

	public onBlacklistChanged(blacklist: BlacklistItem[]) {
		this.updateViewModel(blacklist)
	}

	public onSearchPatternChanged() {
		this.applyDebouncedSearchPattern()
		this.updateViewModel(this.storeService.getState().fileSettings.blacklist)
	}

	public onClickBlacklistPattern(blacklistType: BlacklistType) {
		this.storeService.dispatch(addBlacklistItem({ path: this._viewModel.searchPattern, type: blacklistType }))
		this.resetSearchPattern()
	}

	public isSearchPatternEmpty() {
		return this._viewModel.searchPattern === ""
	}

	private updateViewModel(blacklist: BlacklistItem[]) {
		this._viewModel.isPatternExcluded = this.isPatternBlacklisted(blacklist, BlacklistType.exclude)
		this._viewModel.isPatternHidden = this.isPatternBlacklisted(blacklist, BlacklistType.flatten)
	}

	private isPatternBlacklisted(blacklist: BlacklistItem[], blacklistType: BlacklistType): boolean {
		return !!blacklist.find(x => this._viewModel.searchPattern == x.path && blacklistType == x.type)
	}

	private resetSearchPattern() {
		this._viewModel.searchPattern = ""
		this.applyDebouncedSearchPattern()
	}

	private applySettingsSearchPattern() {
		this.storeService.dispatch(setSearchPattern(this._viewModel.searchPattern))
	}
}

export const searchBarComponent = {
	selector: "searchBarComponent",
	template: require("./searchBar.component.html"),
	controller: SearchBarController
}
