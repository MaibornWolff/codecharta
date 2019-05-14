import { SettingsService, SettingsServiceSubscriber } from "../../state/settings.service"
import "./blacklistPanel.component.scss"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { Settings, BlacklistItem, BlacklistType, RecursivePartial } from "../../codeCharta.model"
import { IRootScopeService } from "angular"

export class BlacklistPanelController implements SettingsServiceSubscriber {
	private _viewModel: {
		blacklist: Array<BlacklistItem>
	} = {
		blacklist: []
	}

	constructor(private codeMapActionsService: CodeMapActionsService, $rootScope: IRootScopeService) {
		SettingsService.subscribe($rootScope, this)
	}

	public onSettingsChanged(settings: Settings, supdate: RecursivePartial<Settings>, event: angular.IAngularEvent) {
		if (settings.fileSettings.blacklist) {
			this._viewModel.blacklist = settings.fileSettings.blacklist
		}
	}

	public removeBlacklistEntry(entry: BlacklistItem) {
		this.codeMapActionsService.removeBlacklistEntry(entry)
	}

	public sortByExcludes(item: BlacklistItem) {
		return item && item.type == BlacklistType.exclude ? 0 : 1
	}
}

export const blacklistPanelComponent = {
	selector: "blacklistPanelComponent",
	template: require("./blacklistPanel.component.html"),
	controller: BlacklistPanelController
}
