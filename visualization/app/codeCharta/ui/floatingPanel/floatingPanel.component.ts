import "./floatingPanel.component.scss"
import { SettingsService, SettingsServiceSubscriber } from "../../state/settings.service"
import { IRootScopeService, IAngularEvent } from "angular"
import { Settings, RecursivePartial, FloatingPanelMode } from "../../codeCharta.model"

export class FloatingPanelController implements SettingsServiceSubscriber {
	private _viewModel: { floatingPanelMode: FloatingPanelMode } = {
		floatingPanelMode: FloatingPanelMode.search
	}

	/* @ngInject */
	constructor($rootScope: IRootScopeService) {
		SettingsService.subscribe($rootScope, this)
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>, event: IAngularEvent) {
		if (this.isfloatingPanelModeUpdated(update)) {
			this._viewModel.floatingPanelMode = update.dynamicSettings.floatingPanelMode
		}
	}

	private isfloatingPanelModeUpdated(update: RecursivePartial<Settings>) {
		return update.dynamicSettings && update.dynamicSettings.floatingPanelMode !== undefined
	}
}

export const floatingPanelComponent = {
	selector: "floatingPanelComponent",
	template: require("./floatingPanel.component.html"),
	controller: FloatingPanelController
}
