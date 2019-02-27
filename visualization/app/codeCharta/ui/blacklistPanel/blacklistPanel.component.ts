import { SettingsService, SettingsServiceSubscriber } from "../../core/settings/settings.service"
import "./blacklistPanel.component.scss"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { Settings, BlacklistItem, BlacklistType } from "../../codeCharta.model"
import { IAngularEvent, IRootScopeService } from "angular"

export class BlacklistPanelController implements SettingsServiceSubscriber {
	public blacklist: Array<BlacklistItem>

	constructor(
		private settingsService: SettingsService,
		private codeMapActionsService: CodeMapActionsService,
		$rootScope: IRootScopeService
	) {
		SettingsService.subscribe($rootScope, this)
		this.onSettingsChanged(settingsService.getSettings(), null)
	}

	public onSettingsChanged(settings: Settings, event: IAngularEvent) {
		if (settings.fileSettings.blacklist) {
			this.blacklist = settings.fileSettings.blacklist
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
