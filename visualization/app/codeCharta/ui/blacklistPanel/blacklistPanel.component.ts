import "./blacklistPanel.component.scss"
import { BlacklistItem, BlacklistType } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { BlacklistService, BlacklistSubscriber } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { removeBlacklistItem } from "../../state/store/fileSettings/blacklist/blacklist.actions"
import { StoreService } from "../../state/store.service"

export class BlacklistPanelController implements BlacklistSubscriber {
	private _viewModel: {
		flatten: Array<BlacklistItem>
		exclude: Array<BlacklistItem>
	} = {
		flatten: [],
		exclude: []
	}

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		BlacklistService.subscribe(this.$rootScope, this)
	}

	onBlacklistChanged(blacklist: BlacklistItem[]) {
		const flattened: BlacklistItem[] = []
		const excluded: BlacklistItem[] = []

		for (const item of blacklist) {
			if (item.type === BlacklistType.flatten) {
				flattened.push(item)
			} else {
				excluded.push(item)
			}
		}

		this._viewModel.flatten = flattened
		this._viewModel.exclude = excluded
	}

	removeBlacklistEntry(entry: BlacklistItem) {
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
