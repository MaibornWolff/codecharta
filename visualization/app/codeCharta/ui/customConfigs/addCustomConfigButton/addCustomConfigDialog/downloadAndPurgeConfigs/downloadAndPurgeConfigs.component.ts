import { Component, Inject, Input, OnInit } from "@angular/core"
import { ErrorDialogComponent } from "../../../../dialogs/errorDialog/errorDialog.component"
import { ConfirmationDialogComponent } from "../../../../dialogs/confirmationDialog/confirmationDialog.component"
import { CustomConfigHelper } from "../../../../../util/customConfigHelper"
import { CustomConfig, ExportCustomConfig } from "../../../../../model/customConfig/customConfig.api.model"
import { MatDialog } from "@angular/material/dialog"
import { validateLocalStorageSize } from "../validateLocalStorageSize"
import { CustomConfigFileStateConnector } from "../../../customConfigFileStateConnector"

@Component({
	template: require("./downloadAndPurgeConfigs.component.html"),
	selector: "cc-download-and-purge-configs"
})
export class DownloadAndPurgeConfigsComponent implements OnInit {
	@Input() customConfigFileStateConnector: CustomConfigFileStateConnector
	localStorageSizeWarningMessage = ""
	private customConfigAgeLimitInMonths = 6
	private purgeableConfigs = new Set<CustomConfig>()

	constructor(@Inject(MatDialog) private dialog: MatDialog) {}

	ngOnInit(): void {
		this.localStorageSizeWarningMessage = validateLocalStorageSize()
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
