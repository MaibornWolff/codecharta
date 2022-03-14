import { Component, Inject, Input, OnInit } from "@angular/core"
import { ErrorDialogComponent } from "../../../../dialogs/errorDialog/errorDialog.component"
import { ConfirmationDialogComponent } from "../../../../dialogs/confirmationDialog/confirmationDialog.component"
import { CustomConfigHelper } from "../../../../../util/customConfigHelper"
import { MatDialog } from "@angular/material/dialog"
import { validateLocalStorageSize } from "../validateLocalStorageSize"
import { CustomConfigFileStateConnector } from "../../../customConfigFileStateConnector"
import { downloadAndCollectPurgeableConfigs } from "../downloadAndCollectPurgeableConfigs"

@Component({
	template: require("./downloadAndPurgeConfigs.component.html"),
	selector: "cc-download-and-purge-configs"
})
export class DownloadAndPurgeConfigsComponent implements OnInit {
	@Input() customConfigFileStateConnector: CustomConfigFileStateConnector
	isLocalStorageSizeValid = true

	constructor(@Inject(MatDialog) private dialog: MatDialog) {}

	ngOnInit(): void {
		this.isLocalStorageSizeValid = validateLocalStorageSize()
	}

	showPurgeConfirmDialog() {
		const purgeableConfigs = downloadAndCollectPurgeableConfigs(this.customConfigFileStateConnector)
		if (purgeableConfigs.size === 0) {
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
			if (confirmation) {
				CustomConfigHelper.deleteCustomConfigs([...purgeableConfigs])
			}
		})
	}
}
