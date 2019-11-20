import "./blacklistPanel.component.scss"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { BlacklistItem, BlacklistType, SearchPanelMode } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { SearchPanelServiceSubscriber, SearchPanelService } from "../../state/searchPanel.service"
import { BlacklistSubscriber } from "../../state/settingsService/settings.service.events"
import { StoreService } from "../../state/store.service"

export class BlacklistPanelController implements BlacklistSubscriber, SearchPanelServiceSubscriber {
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
		StoreService.subscribeToBlacklist($rootScope, this)
		SearchPanelService.subscribe($rootScope, this)
	}

	public onBlacklistChanged(blacklist: BlacklistItem[]) {
		this._viewModel.hide = blacklist.filter(x => x.type === BlacklistType.hide)
		this._viewModel.exclude = blacklist.filter(x => x.type === BlacklistType.exclude)
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
