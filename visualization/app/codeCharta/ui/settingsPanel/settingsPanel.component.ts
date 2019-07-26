import "./settingsPanel.component.scss"
import { SettingsService, SettingsServiceSubscriber } from "../../state/settings.service"
import $ from "jquery"
import { RecursivePartial, Settings } from "../../codeCharta.model"
import { IAngularEvent, IRootScopeService, ITimeoutService } from "angular"

export class SettingsPanelController implements SettingsServiceSubscriber {
	private _viewModel = {
		blacklistLength: 0
	}

	constructor(private $rootScope: IRootScopeService, private $timeout: ITimeoutService) {
		SettingsService.subscribe(this.$rootScope, this)
	}

	public collapseAndUpdateChildRzSlider($panel) {
		$panel.collapse()
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>, event: IAngularEvent) {
		if (settings.fileSettings.blacklist.length != this._viewModel.blacklistLength) {
			this.highlightCounterIcon()
		}
		this._viewModel.blacklistLength = settings.fileSettings.blacklist.length
	}

	public highlightCounterIcon() {
		const panelElement = $(".item-counter").closest("md-expansion-panel")
		panelElement.addClass("highlight")

		this.$timeout(() => {
			panelElement.removeClass("highlight")
		}, 200)
	}
}

export const settingsPanelComponent = {
	selector: "settingsPanelComponent",
	template: require("./settingsPanel.component.html"),
	controller: SettingsPanelController
}
