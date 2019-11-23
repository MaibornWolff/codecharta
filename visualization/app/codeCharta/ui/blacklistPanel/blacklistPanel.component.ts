import "./blacklistPanel.component.scss"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { BlacklistItem, BlacklistType, SearchPanelMode } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { SearchPanelServiceSubscriber, SearchPanelService } from "../../state/searchPanel.service"
import { BlacklistSubscriber } from "../../state/settingsService/settings.service.events"
import { BlacklistService } from "../../state/store/fileSettings/blacklist/blacklist.service"

export class BlacklistPanelController implements BlacklistSubscriber, SearchPanelServiceSubscriber {
	private _viewModel: {
		flatten: Array<BlacklistItem>
		exclude: Array<BlacklistItem>
		searchPanelMode: SearchPanelMode
	} = {
		flatten: null,
		exclude: null,
		searchPanelMode: null
	}

	constructor(private codeMapActionsService: CodeMapActionsService, $rootScope: IRootScopeService) {
		BlacklistService.subscribeToBlacklist($rootScope, this)
		SearchPanelService.subscribe($rootScope, this)
	}

	public onBlacklistChanged(blacklist: BlacklistItem[]) {
		this._viewModel.flatten = blacklist.filter(x => x.type === BlacklistType.flatten)
		this._viewModel.exclude = blacklist.filter(x => x.type === BlacklistType.exclude)
	}

	public onSearchPanelModeChanged(searchPanelMode: SearchPanelMode) {
		this._viewModel.searchPanelMode = searchPanelMode
	}

	public removeBlacklistEntry(entry: BlacklistItem) {
		this.codeMapActionsService.removeBlacklistEntry(entry)
	}
}

export const blacklistPanelFlattenComponent = {
	selector: "blacklistPanelExcludeComponent",
	template: require("./blacklistPanel.exclude.component.html"),
	controller: BlacklistPanelController
}

export const blacklistPanelExcludeComponent = {
	selector: "blacklistPanelFlattenComponent",
	template: require("./blacklistPanel.flatten.component.html"),
	controller: BlacklistPanelController
}
