import "./addCustomDialog.component.scss"
import { Component, Inject, OnInit } from "@angular/core"
import { FormControl, Validators, AbstractControl, ValidatorFn } from "@angular/forms"
import { Store } from "../../../../state/angular-redux/store"
import { CustomConfigFileStateConnector } from "../../customConfigFileStateConnector"
import { CustomConfigHelper } from "../../../../util/customConfigHelper"
import { filesSelector } from "../../../../state/store/files/files.selector"
import { buildCustomConfigFromState } from "../../../../util/customConfigBuilder"
import { State } from "../../../../state/angular-redux/state"

@Component({
	template: require("./addCustomConfigDialog.component.html")
})
export class AddCustomConfigDialogComponent implements OnInit {
	private readonly customConfigFileStateConnector: CustomConfigFileStateConnector
	private files = []
	private customLocalStorageLimitInKB = 768
	localStorageSizeWarningMessage = ""
	customConfigName: FormControl

	constructor(@Inject(Store) private store: Store, @Inject(State) private state: State) {
		this.store.select(filesSelector).subscribe(files => {
			this.files = files
		})
		this.customConfigFileStateConnector = new CustomConfigFileStateConnector(this.files)
	}

	getErrorMessage() {
		if (this.customConfigName.hasError("required")) {
			return "Please enter a view name."
		}
		return this.customConfigName.hasError("Error") ? this.customConfigName.getError("Error") : ""
	}

	ngOnInit(): void {
		// Provide a new suggestion for the CustomConfig name, if the selected map (name) has changed
		// And validate it, in case the name is already given to an existing CustomConfig.
		this.customConfigName = new FormControl("", [Validators.required, validateYolo(this.customConfigFileStateConnector)])
		this.customConfigName.setValue(CustomConfigHelper.getConfigNameSuggestionByFileState(this.customConfigFileStateConnector))
		this.validateLocalStorageSize()
	}

	addCustomConfig() {
		const newCustomConfig = buildCustomConfigFromState(this.customConfigName.value, this.state.getValue())
		CustomConfigHelper.addCustomConfig(newCustomConfig)
	}

	private validateLocalStorageSize() {
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

		this.localStorageSizeWarningMessage =
			localStorageSizeInKB > this.customLocalStorageLimitInKB
				? "Do you want to download and then purge old unused Configs to make space for new ones?"
				: ""
	}

	/*	showPurgeConfirmDialog() {
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
	}*/
}

export function validateYolo(customConfigFileStateConnector: CustomConfigFileStateConnector): ValidatorFn {
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
