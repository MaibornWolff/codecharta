import { getUpdatedBlacklistItemPath } from "../../../../util/nodePathHelper"
import { CCFile, MarkedPackage } from "../../../../codeCharta.model"

export function getMergedMarkedPackages(inputFiles: CCFile[], withUpdatedPath: boolean): MarkedPackage[] {
	const markedPackages: Map<string, MarkedPackage> = new Map()

	if (inputFiles.length == 1) {
		return inputFiles[0].settings.fileSettings.markedPackages
	}

	for (const inputFile of inputFiles) {
		if (inputFile.settings.fileSettings.markedPackages) {
			for (const oldMarkedPackages of inputFile.settings.fileSettings.markedPackages) {
				const markedPackage: MarkedPackage = {
					path: withUpdatedPath
						? getUpdatedBlacklistItemPath(inputFile.fileMeta.fileName, oldMarkedPackages.path)
						: oldMarkedPackages.path,
					color: oldMarkedPackages.color
				}
				markedPackages.set(`${markedPackage.path}|${markedPackage.color}`, markedPackage)
			}
		}
	}
	return Array.from(markedPackages.values())
}
