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
		this.onSettingsChanged(settingsService.settings, null)
	}

	public onChange() {
		this.settingsService.applySettings()
	}

	public onSettingsChanged(settings: Settings, event: IAngularEvent) {
		if (settings.dynamicSettings.blacklist) {
			this.blacklist = settings.dynamicSettings.blacklist
		}
	}

	public removeBlacklistEntry(entry: BlacklistItem) {
		this.codeMapActionsService.removeBlacklistEntry(entry)
		this.onChange()
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
