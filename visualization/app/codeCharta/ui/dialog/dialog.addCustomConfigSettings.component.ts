import "./dialog.component.scss"
import { CustomConfigHelper } from "../../util/customConfigHelper"
import { StoreService } from "../../state/store.service"
import { FilesSelectionSubscriber, FilesService } from "../../state/store/files/files.service"
import { FileState } from "../../model/files/files"
import { IRootScopeService } from "angular"
import { CustomConfigFileStateConnector } from "../customConfigs/customConfigFileStateConnector"
import { buildCustomConfigFromState } from "../../util/customConfigBuilder"

export class DialogAddCustomConfigSettingsComponent implements FilesSelectionSubscriber {
	private customConfigFileStateConnector: CustomConfigFileStateConnector

	private _viewModel: {
		customConfigName: string
		addWarningMessage: string
	} = {
		customConfigName: "",
		addWarningMessage: ""
	}

	constructor(private $rootScope: IRootScopeService, private $mdDialog, private storeService: StoreService) {
		FilesService.subscribe(this.$rootScope, this)
		this.onFilesSelectionChanged(this.storeService.getState().files)
	}

	onFilesSelectionChanged(files: FileState[]) {
		this.customConfigFileStateConnector = new CustomConfigFileStateConnector(files)

		// Provide a new suggestion for the CustomConfig name, if the selected map (name) has changed
		// And validate it, in case the name is already given to an existing CustomConfig.
		this._viewModel.customConfigName = CustomConfigHelper.getViewNameSuggestionByFileState(this.customConfigFileStateConnector)
		this.validateCustomConfigName()
	}

	hide() {
		this.$mdDialog.hide()
	}

	addCustomConfig() {
		const newCustomConfig = buildCustomConfigFromState(this._viewModel.customConfigName, this.storeService.getState())

		CustomConfigHelper.addCustomConfig(newCustomConfig)

		this.hide()
	}

	validateCustomConfigName() {
		if (
			CustomConfigHelper.hasCustomConfig(
				this.customConfigFileStateConnector.getMapSelectionMode(),
				this.customConfigFileStateConnector.getSelectedMaps(),
				this._viewModel.customConfigName
			)
		) {
			this._viewModel.addWarningMessage = '<i class="fa fa-warning"></i> A Custom Config with this name already exists.'
		} else {
			this._viewModel.addWarningMessage = ""
		}
	}

	isNewCustomConfigValid() {
		return this._viewModel.customConfigName !== "" && !this._viewModel.addWarningMessage
	}
}

export const addCustomConfigSettingsComponent = {
	selector: "addCustomConfigSettingsComponent",
	template: require("./dialog.addCustomConfigSettings.component.html"),
	controller: DialogAddCustomConfigSettingsComponent,
	clickOutsideToClose: true,
	controllerAs: "$ctrl"
}
