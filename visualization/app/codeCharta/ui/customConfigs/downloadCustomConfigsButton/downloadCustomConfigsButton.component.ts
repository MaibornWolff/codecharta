import { Component, Inject, OnInit } from "@angular/core"
import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { CustomConfigFileStateConnector } from "../customConfigFileStateConnector"
import { State } from "../../../state/angular-redux/state"
import { filesSelector } from "../../../state/store/files/files.selector"
import { CustomConfig, ExportCustomConfig } from "../../../model/customConfig/customConfig.api.model"

@Component({ template: require("./downloadCustomConfigsButton.component.html") })
export class DownloadCustomConfigsButtonComponent implements OnInit {
	private customConfigFileStateConnector: CustomConfigFileStateConnector
	private downloadableConfigs: Map<string, ExportCustomConfig> = new Map()
	hasDownloadableConfigs = false

	constructor(@Inject(State) private state: State) {}

	ngOnInit(): void {
		const files = filesSelector(this.state.getValue())
		this.customConfigFileStateConnector = new CustomConfigFileStateConnector(files)
		this.preloadDownloadableConfigs()
	}

	private isConfigApplicableForUploadedMaps(customConfig: CustomConfig) {
		const mapChecksumsOfConfig = customConfig.mapChecksum.split(";")
		for (const checksumOfConfig of mapChecksumsOfConfig) {
			if (this.customConfigFileStateConnector.isMapAssigned(checksumOfConfig)) {
				return true
			}
		}
		return false
	}

	private preloadDownloadableConfigs() {
		this.downloadableConfigs.clear()
		const customConfigs = CustomConfigHelper.getCustomConfigs()

		for (const [key, value] of customConfigs.entries()) {
			// Only Configs which are applicable for at least one of the uploaded maps should be downloaded.
			if (this.isConfigApplicableForUploadedMaps(value)) {
				this.downloadableConfigs.set(key, CustomConfigHelper.createExportCustomConfigFromConfig(value))
			}
		}

		this.hasDownloadableConfigs = this.downloadableConfigs.size > 0
	}

	downloadPreloadedCustomConfigs() {
		if (this.downloadableConfigs.size === 0) {
			return
		}

		CustomConfigHelper.downloadCustomConfigs(this.downloadableConfigs, this.customConfigFileStateConnector)
	}
}
