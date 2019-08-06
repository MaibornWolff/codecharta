import { SettingsService, SettingsServiceSubscriber } from "../../state/settings.service"
import "./blacklistPanel.component.scss"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { Settings, BlacklistItem, BlacklistType, RecursivePartial, SearchPanelMode } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { SearchPanelServiceSubscriber, SearchPanelService } from "../../state/searchPanel.service"

export class BlacklistPanelController implements SettingsServiceSubscriber, SearchPanelServiceSubscriber {
	private _viewModel: {
		hide: Array<BlacklistItem>
		exclude: Array<BlacklistItem>
		searchPanelMode: SearchPanelMode
	} = {
		hide: null,
		exclude: null,
		searchPanelMode: null
	}

	constructor(private codeMapActionsService: CodeMapActionsService, $rootScope: IRootScopeService) {
		SettingsService.subscribe($rootScope, this)
		SearchPanelService.subscribe($rootScope, this)
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>) {
		if (update.fileSettings && update.fileSettings.blacklist) {
			let blacklist = update.fileSettings.blacklist as [BlacklistItem]
			this._viewModel.hide = blacklist.filter(x => x.type === BlacklistType.hide)
			this._viewModel.exclude = blacklist.filter(x => x.type === BlacklistType.exclude)
		}
	}

	public onSearchPanelModeChanged(searchPanelMode: SearchPanelMode) {
		this._viewModel.searchPanelMode = searchPanelMode
	}

	public removeBlacklistEntry(entry: BlacklistItem) {
		this.codeMapActionsService.removeBlacklistEntry(entry)
	}
}

export const blacklistPanelComponent = {
	selector: "blacklistPanelComponent",
	template: require("./blacklistPanel.component.html"),
	controller: BlacklistPanelController
}
