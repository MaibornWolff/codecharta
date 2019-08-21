import "./heightSettingsPanel.component.scss"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settingsService/settings.service"
import { FileState, RecursivePartial, Settings } from "../../codeCharta.model"
import { FileStateService, FileStateServiceSubscriber } from "../../state/fileState.service"
import { FileStateHelper } from "../../util/fileStateHelper"
import { SettingsServiceSubscriber } from "../../state/settingsService/settings.service.events"

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

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>) {
		this._viewModel.amountOfTopLabels = settings.appSettings.amountOfTopLabels
		this._viewModel.scalingY = settings.appSettings.scaling.y
		this._viewModel.invertHeight = settings.appSettings.invertHeight
	}

	public onFileSelectionStatesChanged(fileStates: FileState[]) {
		this._viewModel.isDeltaState = FileStateHelper.isDeltaState(fileStates)
	}

	public onImportedFilesChanged(fileStates: FileState[]) {}

	public applySettingsAmountOfTopLabels() {
		this.settingsService.updateSettings({
			appSettings: {
				amountOfTopLabels: this._viewModel.amountOfTopLabels
			}
		})
	}

	public applySettingsInvertHeight() {
		this.settingsService.updateSettings({
			appSettings: {
				invertHeight: this._viewModel.invertHeight
			}
		})
	}

	public applySettingsScaling() {
		this.settingsService.updateSettings({
			appSettings: {
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
