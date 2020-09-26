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
		flatten: null,
		exclude: null
	}

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		BlacklistService.subscribe(this.$rootScope, this)
	}

	onBlacklistChanged(blacklist: BlacklistItem[]) {
		// Use a set to uniquify the entries
		const flattened: Set<BlacklistItem> = new Set()
		const excluded: Set<BlacklistItem> = new Set()

		for (const item of blacklist) {
			if (item.type === BlacklistType.flatten) {
				flattened.add(item)
			} else {
				excluded.add(item)
			}
		}

		this._viewModel.flatten = [...flattened]
		this._viewModel.exclude = [...excluded]
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
