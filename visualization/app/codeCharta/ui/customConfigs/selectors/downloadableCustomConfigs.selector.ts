import { CcState } from "../../../state/store/store"
import { createSelector } from "../../../state/angular-redux/createSelector"
import { FileState } from "../../../model/files/files"
import { CustomConfig, ExportCustomConfig } from "../../../model/customConfig/customConfig.api.model"
import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { visibleFileStatesSelector } from "../../../state/selectors/visibleFileStates.selector"

export type DownloadableConfigs = Map<string, ExportCustomConfig>

export const getDownloadableCustomViews = (files: FileState[]): DownloadableConfigs | undefined => {
	if (files === undefined) {
		return
	}

	const downloadableConfigs = new Map() as DownloadableConfigs
	const customConfigs = CustomConfigHelper.getCustomConfigs()
	const mapChecksums = []

	files.map(file => mapChecksums.push(file.file.fileMeta.fileChecksum))

	for (const [checksum, customConfig] of customConfigs.entries()) {
		// Only Configs which are applicable for at least one of the uploaded maps should be downloaded.
		if (isConfigApplicableForUploadedMaps(customConfig, mapChecksums)) {
			downloadableConfigs.set(checksum, CustomConfigHelper.createExportCustomConfigFromConfig(customConfig))
		}
	}
	return downloadableConfigs
}

function isConfigApplicableForUploadedMaps(customConfig: CustomConfig, mapChecksums: string[]) {
	const mapChecksumsOfConfig = customConfig.mapChecksum.split(";")
	for (const checksumOfConfig of mapChecksumsOfConfig) {
		if (mapChecksums.includes(checksumOfConfig)) {
			return true
		}
	}
	return false
}

export const downloadableCustomConfigsSelector: (state: CcState) => DownloadableConfigs = createSelector(
	[visibleFileStatesSelector],
	getDownloadableCustomViews
)
