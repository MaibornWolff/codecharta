import { Inject, Injectable } from "@angular/core"
import { fileMapCheckSumsSelector } from "../fileMapCheckSums.selector"
import { Store } from "../../../../state/angular-redux/store"
import { CustomConfigMapSelectionMode } from "../../../../model/customConfig/customConfig.api.model"
import { CustomConfigItem } from "../../customConfigs.component"

export type CustomConfigInfoMessage = {
	msg: string
	isFullyApplicable: boolean
}

@Injectable()
export class IsCustomConfigApplicableService {
	private mapCheckSumBySelectionMode = new Map<CustomConfigMapSelectionMode, string[]>()
	customConfigInfoMessage: CustomConfigInfoMessage = {
		msg: "",
		isFullyApplicable: true
	}

	constructor(@Inject(Store) private store: Store) {
		this.store.select(fileMapCheckSumsSelector).subscribe(fileMapCheckSums => (this.mapCheckSumBySelectionMode = fileMapCheckSums))
	}

	buildMessage(configItem: CustomConfigItem) {
		const notSelectedMaps = []
		let configMapSelectionMode = ""
		const [currentMapSelectionMode] = this.mapCheckSumBySelectionMode.keys()
		const [currentMapChecksums] = this.mapCheckSumBySelectionMode.values()

		if (configItem.mapSelectionMode !== currentMapSelectionMode) {
			configMapSelectionMode = configItem.mapSelectionMode
		}

		for (const [checksum] of configItem.assignedMaps) {
			if (!currentMapChecksums.includes(checksum)) {
				notSelectedMaps.push(` ${configItem.assignedMaps.get(checksum)}`)
			}
		}

		if (notSelectedMaps.length > 0 && configMapSelectionMode.length > 0) {
			this.customConfigInfoMessage.msg = `This view is partially applicable. To complete your view, please switch to the ${configMapSelectionMode} mode and select the following map(s):${notSelectedMaps}.`
			this.customConfigInfoMessage.isFullyApplicable = false
		} else if (notSelectedMaps.length > 0) {
			this.customConfigInfoMessage.msg = `To fulfill your view, please select the following map(s):${notSelectedMaps}.`
			this.customConfigInfoMessage.isFullyApplicable = false
		} else if (configMapSelectionMode.length > 0) {
			this.customConfigInfoMessage.msg = `This view is partially applicable. To complete your view, please switch to the ${configMapSelectionMode} mode.`
			this.customConfigInfoMessage.isFullyApplicable = false
		} else {
			this.customConfigInfoMessage.msg = `Apply Custom View`
			this.customConfigInfoMessage.isFullyApplicable = true
		}
	}
}
