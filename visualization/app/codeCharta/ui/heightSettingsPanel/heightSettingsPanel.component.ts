import "./heightSettingsPanel.component.scss"
import { IRootScopeService } from "angular"
import { SettingsService, SettingsServiceSubscriber } from "../../state/settings.service"
import { FileState, RecursivePartial, Settings } from "../../codeCharta.model"
import { FileStateService, FileStateServiceSubscriber } from "../../state/fileState.service"
import { FileStateHelper } from "../../util/fileStateHelper"

export class HeightSettingsPanelController implements SettingsServiceSubscriber, FileStateServiceSubscriber {
	private _viewModel: {
		amountOfTopLabels: number
		scalingY: number
		invertHeight: boolean
		isDeltaState: boolean
	} = {
		amountOfTopLabels: null,
		scalingY: null,
		invertHeight: null,
		isDeltaState: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private settingsService: SettingsService) {
		SettingsService.subscribe(this.$rootScope, this)
		FileStateService.subscribe(this.$rootScope, this)
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>, event: angular.IAngularEvent) {
		this._viewModel.amountOfTopLabels = settings.appSettings.amountOfTopLabels
		this._viewModel.scalingY = settings.appSettings.scaling.y
		this._viewModel.invertHeight = settings.appSettings.invertHeight
	}

	public onFileSelectionStatesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
		this._viewModel.isDeltaState = FileStateHelper.isDeltaState(fileStates)
	}

	public onImportedFilesChanged(fileStates: FileState[], event: angular.IAngularEvent) {}

	public applySettings() {
		this.settingsService.updateSettings({
			appSettings: {
				amountOfTopLabels: this._viewModel.amountOfTopLabels,
				invertHeight: this._viewModel.invertHeight,
				scaling: {
					y: this._viewModel.scalingY
				}
			}
		})
	}
}

export const heightSettingsPanelComponent = {
	selector: "heightSettingsPanelComponent",
	template: require("./heightSettingsPanel.component.html"),
	controller: HeightSettingsPanelController
}
