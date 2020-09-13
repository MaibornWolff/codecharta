import { getUpdatedBlacklistItemPath } from "../../../../util/nodePathHelper"
import { BlacklistItem, CCFile } from "../../../../codeCharta.model"

export function getMergedBlacklist(inputFiles: CCFile[], withUpdatedPath: boolean): BlacklistItem[] {
	const blacklist: Map<string, BlacklistItem> = new Map()

	if (inputFiles.length === 1) {
		return inputFiles[0].settings.fileSettings.blacklist
	}

	for (const inputFile of inputFiles) {
		if (inputFile.settings.fileSettings.blacklist) {
			for (const oldBlacklistItem of inputFile.settings.fileSettings.blacklist) {
				const blacklistItem: BlacklistItem = {
					path: withUpdatedPath
						? getUpdatedBlacklistItemPath(inputFile.fileMeta.fileName, oldBlacklistItem.path)
						: oldBlacklistItem.path,
					type: oldBlacklistItem.type
				}
				blacklist.set(`${blacklistItem.path}|${blacklistItem.type}`, blacklistItem)
			}
		}
	}
	return [...blacklist.values()]
}
