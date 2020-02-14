import { BlacklistItem, CCFile } from "../../../../codeCharta.model"
import { getUpdatedBlacklistItemPath } from "../../../../util/nodePathHelper"

export function getMergedBlacklist(inputFiles: CCFile[], withUpdatedPath: boolean): BlacklistItem[] {
	let blacklist: BlacklistItem[] = []

	if (inputFiles.length == 1) {
		return inputFiles[0].settings.fileSettings.blacklist
	}

	for (let inputFile of inputFiles) {
		if (inputFile.settings.fileSettings.blacklist) {
			for (let oldBlacklistItem of inputFile.settings.fileSettings.blacklist) {
				let blacklistItem: BlacklistItem = {
					path: withUpdatedPath
						? getUpdatedBlacklistItemPath(inputFile.fileMeta.fileName, oldBlacklistItem.path)
						: oldBlacklistItem.path,
					type: oldBlacklistItem.type
				}
				const equalBlacklistItems = blacklist.find(b => b.path == blacklistItem.path && b.type == blacklistItem.type)

				if (!equalBlacklistItems) {
					blacklist.push(blacklistItem)
				}
			}
		}
	}
	return blacklist
}
