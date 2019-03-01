import "./settingsPanel.component.scss"
import { SettingsService, SettingsServiceSubscriber } from "../../core/settings/settings.service"
import $ from "jquery"
import { Settings } from "../../codeCharta.model"
import { IAngularEvent } from "angular"

export class SettingsPanelController implements SettingsServiceSubscriber {
	private _viewModel = {
		blacklistLength: 0
	}

	constructor(private $scope, private $timeout) {
		SettingsService.subscribe($scope, this)
		// TODO not sure if we really need this this.onSettingsChanged(this.settingsService.getSettings(), null);
	}

	public collapseAndUpdateChildRzSlider($panel) {
		$panel.collapse()
		//this.$timeout(() => {
        //    //TODO maybe this should be a trigger method of the component where the slider is
		//	this.$scope.$broadcast("rzSliderForceRender")
		//}, 50)
	}

	public onSettingsChanged(settings: Settings, event: IAngularEvent) {
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
