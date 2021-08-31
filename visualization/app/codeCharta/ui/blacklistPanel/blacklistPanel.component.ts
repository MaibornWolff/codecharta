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
		temp: Array<BlacklistItem>
	} = {
		flatten: [],
		exclude: [],
		temp: []
	}

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
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

		this.temporaryNewFunction()
	}

	temporaryNewFunction() {
		const temporary: BlacklistItem[] = []
		this._viewModel.temp = temporary
	}


	removeBlacklistEntry(entry: BlacklistItem) {
		this.storeService.dispatch(removeBlacklistItem(entry))
	}
}

export const blacklistPanelComponent = {
	selector: "blacklistPanelComponent",
	template: require("./blacklistPanel.component.html"),
	controller: BlacklistPanelController
}
