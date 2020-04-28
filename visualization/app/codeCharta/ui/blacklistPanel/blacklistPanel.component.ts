import "./blacklistPanel.component.scss"
import { BlacklistItem } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { BlacklistService, BlacklistSubscriber } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { removeBlacklistItem } from "../../state/store/fileSettings/blacklist/blacklist.actions"
import { StoreService } from "../../state/store.service"
import { Blacklist } from "../../model/blacklist"

export class BlacklistPanelController implements BlacklistSubscriber {
	private _viewModel: {
		flatten: Array<BlacklistItem>
		exclude: Array<BlacklistItem>
	} = {
		flatten: null,
		exclude: null
	}

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		BlacklistService.subscribe(this.$rootScope, this)
	}

	public onBlacklistChanged(blacklist: Blacklist) {
		this._viewModel.flatten = blacklist.getFlattenedItems()
		this._viewModel.exclude = blacklist.getExcludedItems()
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
