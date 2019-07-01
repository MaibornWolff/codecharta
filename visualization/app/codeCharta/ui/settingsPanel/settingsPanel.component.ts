import "./settingsPanel.component.scss"
import { SettingsService, SettingsServiceSubscriber } from "../../state/settings.service"
import $ from "jquery"
import { RecursivePartial, Settings } from "../../codeCharta.model"
import { IAngularEvent, IRootScopeService, ITimeoutService } from "angular"

export class SettingsPanelController {

}

export const settingsPanelComponent = {
	selector: "settingsPanelComponent",
	template: require("./settingsPanel.component.html"),
	controller: SettingsPanelController
}
