import "./dialog.component.scss"
import { CustomConfigHelper } from "../../util/customConfigHelper"
import { StoreService } from "../../state/store.service"
import { FilesSelectionSubscriber, FilesService } from "../../state/store/files/files.service"
import { FileState } from "../../model/files/files"
import { IRootScopeService } from "angular"
import { CustomConfigFileStateConnector } from "../customConfigs/customConfigFileStateConnector"
import { buildCustomConfigFromState } from "../../util/customConfigBuilder"
import { CustomConfig, ExportCustomConfig } from "../../model/customConfig/customConfig.api.model"
import { DialogService } from "./dialog.service"

export class DialogAddCustomConfigSettingsComponent implements FilesSelectionSubscriber {
	private customConfigFileStateConnector: CustomConfigFileStateConnector
	private purgeableConfigs: Set<CustomConfig> = new Set()
	private customLocalStorageLimitInKB = 768
	private customConfigAgeLimitInMonths = 6

	private _viewModel: {
		customConfigName: string
		addErrorMessage: string
		localStorageSizeWarningMessage: string
	} = {
		customConfigName: "",
		addErrorMessage: "",
		localStorageSizeWarningMessage: ""
	}

	constructor(
		private $rootScope: IRootScopeService,
		private $mdDialog,
		private storeService: StoreService,
		private dialogService: DialogService
	) {
		FilesService.subscribe(this.$rootScope, this)
		this.onFilesSelectionChanged(this.storeService.getState().files)
		this.validateLocalStorageSize()
	}

	onFilesSelectionChanged(files: FileState[]) {
		this.customConfigFileStateConnector = new CustomConfigFileStateConnector(files)

		// Provide a new suggestion for the CustomConfig name, if the selected map (name) has changed
		// And validate it, in case the name is already given to an existing CustomConfig.
		this._viewModel.customConfigName = CustomConfigHelper.getConfigNameSuggestionByFileState(this.customConfigFileStateConnector)
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

	async showPurgeConfirmDialog() {
		this.downloadAndCollectPurgeableOldConfigs()

		if (this.purgeableConfigs.size === 0) {
			this.dialogService.showErrorDialog("Could not download and purge old configs automatically! Please try it by yourself.")
			return
		}

		const confirmDialog = this.$mdDialog
			.confirm()
			.clickOutsideToClose(true)
			.title("Confirm to purge old Configs")
			.htmlContent("Are you sure to delete old Configs now?")
			.ok("Purge Configs now!")
			.cancel("Cancel")

		try {
			await this.$mdDialog.show(confirmDialog)
			// The user has confirmed to purge old Configs.
			this.purgeOldConfigs()
		} catch {
			// The user has cancelled the purge - do nothing.
		}
	}

	purgeOldConfigs() {
		if (!this.purgeableConfigs.size) {
			return
		}

		CustomConfigHelper.deleteCustomConfigs([...this.purgeableConfigs])
	}

	downloadAndCollectPurgeableOldConfigs() {
		this.purgeableConfigs.clear()
		const customConfigs = CustomConfigHelper.getCustomConfigs()

		const downloadableConfigs: Map<string, ExportCustomConfig> = new Map()
		const daysPerMonth = 30

		for (const [key, value] of customConfigs.entries()) {
			if (value?.creationTime === undefined) {
				// Fallback, if creationTime property is not present. This can happen because it was released later.
				value.creationTime = Date.now()
			}

			// Download e.g. 6 month old or older Configs.
			const ageInMonth = (Date.now() - value.creationTime) / (1000 * 60 * 60 * 24 * daysPerMonth)
			if (ageInMonth < this.customConfigAgeLimitInMonths) {
				continue
			}

			downloadableConfigs.set(key, CustomConfigHelper.createExportCustomConfigFromConfig(value))
			this.purgeableConfigs.add(value)
		}

		if (downloadableConfigs.size > 0) {
			CustomConfigHelper.downloadCustomConfigs(downloadableConfigs, this.customConfigFileStateConnector)
		}
	}

	validateCustomConfigName() {
		if (
			CustomConfigHelper.hasCustomConfigByName(
				this.customConfigFileStateConnector.getMapSelectionMode(),
				this.customConfigFileStateConnector.getSelectedMaps(),
				this._viewModel.customConfigName
			)
		) {
			this._viewModel.addErrorMessage = "A Custom Config with this name already exists."
		} else {
			this._viewModel.addErrorMessage = ""
		}
	}

	validateLocalStorageSize() {
		let allStringsConcatenated = ""
		for (const [key, value] of Object.entries(localStorage)) {
			allStringsConcatenated += key + value
		}

		// It does not exist a limit for the total localStorage size that applies to all browsers.
		// Usually 2MB - 10MB are available (5MB seems to be very common).
		// The localStorage size (e.g. 5MB) is assigned per origin.
		// Multiply localStorage characters by 16 (bits( because they are stored in UTF-16.
		// Add 3KB as it seems there is some default overhead.
		const localStorageSizeInKB = 3 + (allStringsConcatenated.length * 16) / 8 / 1024

		if (localStorageSizeInKB > this.customLocalStorageLimitInKB) {
			this._viewModel.localStorageSizeWarningMessage =
				"Do you want to download and then purge old unused Configs to make space for new ones?"
		} else {
			this._viewModel.localStorageSizeWarningMessage = ""
		}
	}

	isNewCustomConfigValid() {
		return this._viewModel.customConfigName !== "" && !this._viewModel.addErrorMessage
	}
}

export const addCustomConfigSettingsComponent = {
	selector: "addCustomConfigSettingsComponent",
	template: require("./dialog.addCustomConfigSettings.component.html"),
	controller: DialogAddCustomConfigSettingsComponent,
	clickOutsideToClose: true,
	controllerAs: "$ctrl"
}
