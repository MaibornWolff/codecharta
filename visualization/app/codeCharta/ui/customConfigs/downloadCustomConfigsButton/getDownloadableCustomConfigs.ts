import { ExportCustomConfig, MapNameByChecksum } from "../../../model/customConfig/customConfig.api.model"
import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { VisibleFilesBySelectionMode } from "../visibleFilesBySelectionMode.selector"

export type DownloadableConfigs = Map<string, ExportCustomConfig>

export const getDownloadableCustomConfigs = ({ assignedMaps }: VisibleFilesBySelectionMode): DownloadableConfigs => {
	const downloadableConfigs: DownloadableConfigs = new Map()
	const customConfigs = CustomConfigHelper.getCustomConfigs()

	for (const [checksum, customConfig] of customConfigs.entries()) {
		// Only Configs which are applicable for at least one of the uploaded maps should be downloaded.
		if (isConfigApplicableForUploadedMaps(customConfig.assignedMaps, assignedMaps)) {
			downloadableConfigs.set(checksum, CustomConfigHelper.createExportCustomConfigFromConfig(customConfig))
		}
	}
	return downloadableConfigs
}

function isConfigApplicableForUploadedMaps(
	assignedMapsOfConfig: MapNameByChecksum,
	assignedMapsOfVisibleFiles: MapNameByChecksum
): boolean {
	const mapChecksumsOfConfig = [...assignedMapsOfConfig.keys()]
	return mapChecksumsOfConfig.some(mapChecksumConfig => assignedMapsOfVisibleFiles.has(mapChecksumConfig))
}
