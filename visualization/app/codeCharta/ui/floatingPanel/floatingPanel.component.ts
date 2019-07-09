import "./floatingPanel.component.scss"
import { SettingsService, SettingsServiceSubscriber } from "../../state/settings.service"
import { IRootScopeService, IAngularEvent } from "angular"
import { Settings, RecursivePartial, FloatingPanelMode } from "../../codeCharta.model"

export class FloatingPanelController implements SettingsServiceSubscriber {
	private settingsService: SettingsService
	
	private _viewModel: { floatingPanelMode: FloatingPanelMode } = {
		floatingPanelMode: FloatingPanelMode.search
	}

	/* @ngInject */
	constructor($rootScope: IRootScopeService, settingsService: SettingsService) {
		SettingsService.subscribe($rootScope, this)
		this.settingsService = settingsService
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>, event: IAngularEvent) {
		if (this.isfloatingPanelModeUpdated(update)) {
			this._viewModel.floatingPanelMode = update.dynamicSettings.floatingPanelMode
		}
	}

	private isfloatingPanelModeUpdated(update: RecursivePartial<Settings>) {
		return update.dynamicSettings && update.dynamicSettings.floatingPanelMode !== undefined
	}

	public toggle(){
		if(this._viewModel.floatingPanelMode != FloatingPanelMode.search){
			this.settingsService.updateSettings({dynamicSettings: {floatingPanelMode: FloatingPanelMode.search}})
		} else {
			this.settingsService.updateSettings({dynamicSettings: {floatingPanelMode: FloatingPanelMode.treeView}})
		}
	}
}

export const floatingPanelComponent = {
	selector: "floatingPanelComponent",
	template: require("./floatingPanel.component.html"),
	controller: FloatingPanelController
}
