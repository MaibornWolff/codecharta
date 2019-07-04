import { SettingsService, SettingsServiceSubscriber } from "../../state/settings.service"
import "./blacklistPanel.component.scss"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { Settings, BlacklistItem, BlacklistType, RecursivePartial, FloatingPanelMode } from "../../codeCharta.model"
import { IRootScopeService } from "angular"

export class BlacklistPanelController implements SettingsServiceSubscriber {
	private _viewModel: {
		hide: Array<BlacklistItem>
		exclude: Array<BlacklistItem>
		floatingPanelMode: FloatingPanelMode
	} = {
		hide: [],
		exclude: [],
		floatingPanelMode: FloatingPanelMode.search
	}

	constructor(private codeMapActionsService: CodeMapActionsService, $rootScope: IRootScopeService) {
		SettingsService.subscribe($rootScope, this)
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>, event: angular.IAngularEvent) {
		if (update.fileSettings && update.fileSettings.blacklist) {
			let blacklist = update.fileSettings.blacklist as [BlacklistItem]
			this._viewModel.hide = blacklist.filter(x => x.type === BlacklistType.hide)
			this._viewModel.exclude = blacklist.filter(x => x.type === BlacklistType.exclude)
		}
		if (update.dynamicSettings && update.dynamicSettings.floatingPanelMode) {
			this._viewModel.floatingPanelMode = update.dynamicSettings.floatingPanelMode
		}
	}

	public removeBlacklistEntry(entry: BlacklistItem) {
		this.codeMapActionsService.removeBlacklistEntry(entry)
	}
}

export const blacklistPanelComponent = {
	selector: "blacklistPanelComponent",
	template: require("./blacklistPanel.component.html"),
	controller: BlacklistPanelController
}
