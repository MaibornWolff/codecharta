import packageJson from "../../../../package.json"
import { Inject, Injectable } from "@angular/core"
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog"
import { ChangelogDialogComponent } from "../../ui/dialogs/changelogDialog/changelogDialog.component"
import { compareVersion } from "./utils/compareVersion"

@Injectable()
export class VersionService {
	readonly version = packageJson.version

	constructor(@Inject(MatDialog) private dialog: MatDialog) {}

	synchronizeLocalCodeChartaVersion() {
		const savedPreviousVersion = localStorage.getItem("codeChartaVersion")
		if (savedPreviousVersion === null) {
			localStorage.setItem("codeChartaVersion", this.version)
			return
		}

		if (compareVersion(savedPreviousVersion, this.version) < 0) {
			this.dialog.open(ChangelogDialogComponent, {
				panelClass: "cc-changelog-dialog",
				data: { previousVersion: savedPreviousVersion, currentVersion: this.version }
			})
			localStorage.setItem("codeChartaVersion", this.version)
		}
	}
}
