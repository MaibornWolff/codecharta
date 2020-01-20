import "./blacklistPanel.component.scss"
import { BlacklistItem, BlacklistType, SearchPanelMode } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { SearchPanelServiceSubscriber, SearchPanelService } from "../../state/searchPanel.service"
import { BlacklistService, BlacklistSubscriber } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { removeBlacklistItem } from "../../state/store/fileSettings/blacklist/blacklist.actions"
import { StoreService } from "../../state/store.service"

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

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		BlacklistService.subscribe(this.$rootScope, this)
		SearchPanelService.subscribe(this.$rootScope, this)
	}

	public onBlacklistChanged(blacklist: BlacklistItem[]) {
		this._viewModel.flatten = blacklist.filter(x => x.type === BlacklistType.flatten)
		this._viewModel.exclude = blacklist.filter(x => x.type === BlacklistType.exclude)
	}

	public onSearchPanelModeChanged(searchPanelMode: SearchPanelMode) {
		this._viewModel.searchPanelMode = searchPanelMode
	}

	public removeBlacklistEntry(entry: BlacklistItem) {
		this.storeService.dispatch(removeBlacklistItem(entry))
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
