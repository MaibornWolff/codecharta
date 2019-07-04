import "./structurePanelSelector.component.scss"
import { SettingsServiceSubscriber, SettingsService } from "../../state/settings.service"
import { Settings, RecursivePartial, FloatingPanelMode, BlacklistType } from "../../codeCharta.model"
import { IAngularEvent, IRootScopeService } from "angular"

export class StructurePanelSelectorController implements SettingsServiceSubscriber {
	private _viewModel: { floatingPanelMode: FloatingPanelMode; hideListLength: number; excludeListLength: number } = {
		floatingPanelMode: FloatingPanelMode.minimized,
		hideListLength: 0,
		excludeListLength: 0
	}

	/* @ngInject */
	constructor(private settingsService: SettingsService, private $rootScope: IRootScopeService) {
		SettingsService.subscribe(this.$rootScope, this)
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>, event: IAngularEvent) {
		console.log(settings.dynamicSettings.floatingPanelMode)
		this._viewModel.floatingPanelMode = settings.dynamicSettings.floatingPanelMode
		this._viewModel.hideListLength = settings.fileSettings.blacklist.filter(x => x.type === BlacklistType.hide).length
		this._viewModel.excludeListLength = settings.fileSettings.blacklist.filter(x => x.type === BlacklistType.exclude).length
	}

	public onToggleFloatingPanelMode(toggleView: FloatingPanelMode) {
		if (toggleView === this._viewModel.floatingPanelMode) {
			this._viewModel.floatingPanelMode = FloatingPanelMode.search
		} else {
			this._viewModel.floatingPanelMode = toggleView
		}

		this.settingsService.updateSettings({
			dynamicSettings: {
				floatingPanelMode: this._viewModel.floatingPanelMode
			}
		})
	}
}

export const structurePanelSelectorComponent = {
	selector: "structurePanelSelectorComponent",
	template: require("./structurePanelSelector.component.html"),
	controller: StructurePanelSelectorController
}
