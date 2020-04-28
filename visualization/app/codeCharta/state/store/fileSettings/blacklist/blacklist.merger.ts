import { getUpdatedBlacklistItemPath } from "../../../../util/nodePathHelper"
import { BlacklistItem, CCFile } from "../../../../codeCharta.model"
import { Blacklist } from "../../../../model/blacklist"

export function getMergedBlacklist(inputFiles: CCFile[], withUpdatedPath: boolean): Blacklist {
	const blacklist = new Blacklist()

	if (inputFiles.length === 1) {
		return inputFiles[0].settings.fileSettings.blacklist
	}

	for (const inputFile of inputFiles) {
		if (inputFile.settings.fileSettings.blacklist) {
			for (const oldBlacklistItem of inputFile.settings.fileSettings.blacklist.getItems()) {
				const blacklistItem: BlacklistItem = {
					path: withUpdatedPath
						? getUpdatedBlacklistItemPath(inputFile.fileMeta.fileName, oldBlacklistItem.path)
						: oldBlacklistItem.path,
					type: oldBlacklistItem.type
				}

				if (!blacklist.has(blacklistItem.path, blacklistItem.type)) {
					blacklist.addBlacklistItem(blacklistItem)
				}
			}
		}
	}
	return blacklist
}
