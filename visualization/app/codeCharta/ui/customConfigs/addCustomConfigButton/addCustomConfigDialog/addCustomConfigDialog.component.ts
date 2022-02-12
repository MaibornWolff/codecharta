import "./addCustomDialog.component.scss"
import { Component, Inject, OnInit } from "@angular/core"
import { FormControl, Validators, AbstractControl, ValidatorFn } from "@angular/forms"
import { Store } from "../../../../state/angular-redux/store"
import { CustomConfigFileStateConnector } from "../../customConfigFileStateConnector"
import { CustomConfigHelper } from "../../../../util/customConfigHelper"
import { filesSelector } from "../../../../state/store/files/files.selector"
import { buildCustomConfigFromState } from "../../../../util/customConfigBuilder"
import { State } from "../../../../state/angular-redux/state"
import { MatDialog } from "@angular/material/dialog"
import { CustomConfig, ExportCustomConfig } from "../../../../model/customConfig/customConfig.api.model"
import { ConfirmationDialogComponent } from "../../../dialogs/confirmationDialog/confirmationDialog.component"
import { ErrorDialogComponent } from "../../../dialogs/errorDialog/errorDialog.component"

export function validateCustomConfigName(customConfigFileStateConnector: CustomConfigFileStateConnector): ValidatorFn {
	return (control: AbstractControl): { Error: string } => {
		const value = control.value
		if (
			!CustomConfigHelper.hasCustomConfigByName(
				customConfigFileStateConnector.getMapSelectionMode(),
				customConfigFileStateConnector.getSelectedMaps(),
				value
			)
		)
			return null
		return { Error: "A Custom View with this name already exists." }
	}
}

@Component({
	template: require("./addCustomConfigDialog.component.html")
})
export class AddCustomConfigDialogComponent implements OnInit {
	private readonly customConfigFileStateConnector: CustomConfigFileStateConnector
	private purgeableConfigs: Set<CustomConfig> = new Set()
	private files = []
	private customLocalStorageLimitInKB = 768
	private customConfigAgeLimitInMonths = 6
	localStorageSizeWarningMessage = ""
	customConfigName: FormControl

	constructor(@Inject(Store) private store: Store, @Inject(State) private state: State, @Inject(MatDialog) private dialog: MatDialog) {
		this.store.select(filesSelector).subscribe(files => {
			this.files = files
		})
		this.customConfigFileStateConnector = new CustomConfigFileStateConnector(this.files)
	}

	ngOnInit(): void {
		this.customConfigName = new FormControl("", [Validators.required, validateCustomConfigName(this.customConfigFileStateConnector)])
		this.customConfigName.setValue(CustomConfigHelper.getConfigNameSuggestionByFileState(this.customConfigFileStateConnector))
		this.validateLocalStorageSize()
	}

	getErrorMessage() {
		if (this.customConfigName.hasError("required")) {
			return "Please enter a view name."
		}
		return this.customConfigName.hasError("Error") ? this.customConfigName.getError("Error") : ""
	}

	addCustomConfig() {
		const newCustomConfig = buildCustomConfigFromState(this.customConfigName.value, this.state.getValue())
		CustomConfigHelper.addCustomConfig(newCustomConfig)
	}

	showPurgeConfirmDialog() {
		this.downloadAndCollectPurgeableOldConfigs()
		if (this.purgeableConfigs.size === 0) {
			this.dialog.open(ErrorDialogComponent, {
				data: {
					title: "Download Error",
					message: "Could not download and purge old configs automatically! Please try it by yourself."
				}
			})
			return
		}

		const dialogReference = this.dialog.open(ConfirmationDialogComponent, {
			panelClass: "cc-confirmation-dialog",
			data: {
				title: "Confirm to purge old Configs",
				message: "Are you sure to delete old Configs now?"
			}
		})

		dialogReference.afterClosed().subscribe(confirmation => {
			if (confirmation) this.purgeOldConfigs()
		})
	}

	private validateLocalStorageSize() {
		let allStringsConcatenated = ""
		for (const [key, value] of Object.entries(localStorage)) {
			allStringsConcatenated += key + value
		}

		// It does not exist a limit for the total localStorage size that applies to all browsers.
		// Usually 2MB - 10MB are available (5MB seems to be very common).
		// The localStorage size (e.g. 5MB) is assigned per origin.
		// Multiply localStorage characters by 16 (bits because they are stored in UTF-16).
		// Add 3KB as it seems there is some default overhead.
		const localStorageSizeInKB = 3 + (allStringsConcatenated.length * 16) / 8 / 1024

		this.localStorageSizeWarningMessage =
			localStorageSizeInKB > this.customLocalStorageLimitInKB
				? "Do you want to download and then purge old unused Configs to make space for new ones?"
				: ""
	}

	private downloadAndCollectPurgeableOldConfigs() {
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

	private purgeOldConfigs() {
		if (this.purgeableConfigs.size === 0) {
			return
		}

		CustomConfigHelper.deleteCustomConfigs([...this.purgeableConfigs])
	}
}
