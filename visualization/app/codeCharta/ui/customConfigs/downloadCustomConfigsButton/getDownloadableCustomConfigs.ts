import { FileState } from "../../../model/files/files"
import { CustomConfig, ExportCustomConfig } from "../../../model/customConfig/customConfig.api.model"
import { CustomConfigHelper } from "../../../util/customConfigHelper"

export type DownloadableConfigs = Map<string, ExportCustomConfig>

export const getDownloadableCustomConfigs = (files: FileState[]): DownloadableConfigs => {
	const downloadableConfigs: DownloadableConfigs = new Map()

	if (files === undefined) {
		return downloadableConfigs
	}

	const customConfigs = CustomConfigHelper.getCustomConfigs()
	const mapChecksumsOfFiles = []

	for (const file of files) {
		mapChecksumsOfFiles.push(file.file.fileMeta.fileChecksum)
	}

	for (const [checksum, customConfig] of customConfigs.entries()) {
		// Only Configs which are applicable for at least one of the uploaded maps should be downloaded.
		if (isConfigApplicableForUploadedMaps(customConfig, mapChecksumsOfFiles)) {
			downloadableConfigs.set(checksum, CustomConfigHelper.createExportCustomConfigFromConfig(customConfig))
		}
	}
	return downloadableConfigs
}

function isConfigApplicableForUploadedMaps(customConfig: CustomConfig, mapChecksumsOfFiles: string[]) {
	const mapChecksumsOfConfig = customConfig.mapChecksum.split(";")
	return mapChecksumsOfConfig.some(mapChecksumConfig => mapChecksumsOfFiles.includes(mapChecksumConfig))
}
