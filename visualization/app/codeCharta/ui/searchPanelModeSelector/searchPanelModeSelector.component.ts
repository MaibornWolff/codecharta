import "./searchPanelModeSelector.component.scss"
import { BlacklistItem, BlacklistType } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { BlacklistService, BlacklistSubscriber } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { StoreService } from "../../state/store.service"
import { SearchPanelMode } from "../searchPanel/searchPanel.component"

export class SearchPanelModeSelectorController implements BlacklistSubscriber {
	searchPanelMode: SearchPanelMode
	private _viewModel: {
		flattenListLength: number
		excludeListLength: number
	} = {
		flattenListLength: 0,
		excludeListLength: 0
	}

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		BlacklistService.subscribe(this.$rootScope, this)
	}

	onBlacklistChanged(blacklist: BlacklistItem[]) {
		const flattened = blacklist.reduce((count, { type }) => {
			if (type === BlacklistType.flatten) {
				count++
			}
			return count
		}, 0)
		this._viewModel.flattenListLength = flattened
		this._viewModel.excludeListLength = blacklist.length - flattened
	}
}

export const searchPanelModeSelectorComponent = {
	selector: "searchPanelModeSelectorComponent",
	template: require("./searchPanelModeSelector.component.html"),
	controller: SearchPanelModeSelectorController,
	bindings: {
		searchPanelMode: "<",
		updateSearchPanelMode: "&"
	}
}
