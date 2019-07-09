import "./searchBar.component.scss"
import { SettingsService, SettingsServiceSubscriber } from "../../state/settings.service"
import { BlacklistType, BlacklistItem, Settings, RecursivePartial, FileState, SearchPanelMode } from "../../codeCharta.model"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { IRootScopeService } from "angular"

export class SearchBarController implements SettingsServiceSubscriber {

	private _viewModel: {
		searchPattern: string
		isPatternHidden: boolean
		isPatternExcluded: boolean
		searchPanelMode: SearchPanelMode
	} = {
		searchPattern: "",
		isPatternHidden: true,
		isPatternExcluded: true,
		searchPanelMode: SearchPanelMode.minimized,
	}

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private settingsService: SettingsService,
		private codeMapActionsService: CodeMapActionsService
	) {
		SettingsService.subscribe(this.$rootScope, this)
	}

	public applySettingsSearchPattern() {
		this.settingsService.updateSettings({
			dynamicSettings: {
				searchPattern: this._viewModel.searchPattern
			}
		})
	}

	public onFileSelectionStatesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
		this.resetSearchPattern()
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>, event: angular.IAngularEvent) {
		this.updateViewModel(settings.fileSettings.blacklist, settings.dynamicSettings.searchPanelMode)
	}

	public onClickBlacklistPattern(blacklistType: BlacklistType) {
		this.codeMapActionsService.pushItemToBlacklist({ path: this._viewModel.searchPattern, type: blacklistType })
		this.resetSearchPattern()
	}

	private updateViewModel(blacklist: BlacklistItem[], searchPanelMode: SearchPanelMode) {
		this._viewModel.isPatternExcluded = this.isPatternBlacklisted(blacklist, BlacklistType.exclude)
		this._viewModel.isPatternHidden = this.isPatternBlacklisted(blacklist, BlacklistType.hide)
		this._viewModel.searchPanelMode = searchPanelMode
	}

	private isPatternBlacklisted(blacklist: BlacklistItem[], blacklistType: BlacklistType): boolean {
		return !!blacklist.find(x => this._viewModel.searchPattern == x.path && blacklistType == x.type)
	}

	private resetSearchPattern() {
		this._viewModel.searchPattern = ""
		this.applySettingsSearchPattern()
	}
}

export const searchBarComponent = {
	selector: "searchBarComponent",
	template: require("./searchBar.component.html"),
	controller: SearchBarController
}
