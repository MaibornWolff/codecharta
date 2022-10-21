import { CustomConfig, ExportCustomConfig } from "../../../../model/customConfig/customConfig.api.model"
import { CustomConfigHelper } from "../../../../util/customConfigHelper"

const customConfigAgeLimitInMonths = 6

export function downloadAndCollectPurgeableConfigs() {
	const purgeableConfigs = new Set<CustomConfig>()
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
		if (ageInMonth >= customConfigAgeLimitInMonths) {
			downloadableConfigs.set(key, CustomConfigHelper.createExportCustomConfigFromConfig(value))
			purgeableConfigs.add(value)
		}
	}

	if (downloadableConfigs.size > 0) {
		CustomConfigHelper.downloadCustomConfigs(downloadableConfigs)
	}

	return purgeableConfigs
}
