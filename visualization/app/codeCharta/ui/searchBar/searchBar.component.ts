import "./searchBar.component.scss"
import { SettingsService } from "../../state/settingsService/settings.service"
import { BlacklistType, BlacklistItem, FileState } from "../../codeCharta.model"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { IRootScopeService } from "angular"
import { BlacklistSubscriber } from "../../state/settingsService/settings.service.events"
import { FileStateService, FileStateServiceSubscriber } from "../../state/fileState.service"
import { StoreService } from "../../state/store.service"
import { setSearchPattern } from "../../state/store/dynamicSettings/searchPattern/searchPattern.actions"
import _ from "lodash"

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
	constructor(
		private $rootScope: IRootScopeService,
		private settingsService: SettingsService,
		private codeMapActionsService: CodeMapActionsService,
		private storeService: StoreService
	) {
		SettingsService.subscribeToBlacklist(this.$rootScope, this)
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

	public onClickBlacklistPattern(blacklistType: BlacklistType) {
		this.codeMapActionsService.pushItemToBlacklist({ path: this._viewModel.searchPattern, type: blacklistType })
		this.resetSearchPattern()
	}

	public isSearchPatternEmpty() {
		return this._viewModel.searchPattern === ""
	}

	public onSearchPatternChanged() {
		this.applyDebouncedSearchPattern()
		this.updateViewModel(this.storeService.getState().fileSettings.blacklist)
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
		this.settingsService.updateSettings({
			dynamicSettings: {
				searchPattern: this._viewModel.searchPattern
			}
		})
		this.storeService.dispatch(setSearchPattern(this._viewModel.searchPattern))
	}
}

export const searchBarComponent = {
	selector: "searchBarComponent",
	template: require("./searchBar.component.html"),
	controller: SearchBarController
}
