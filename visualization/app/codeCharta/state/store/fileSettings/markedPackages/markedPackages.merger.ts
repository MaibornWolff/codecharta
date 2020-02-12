import { CCFile, MarkedPackage } from "../../../../codeCharta.model"
import { getUpdatedBlacklistItemPath } from "../../../../util/nodePathHelper"

export function getMergedMarkedPackages(inputFiles: CCFile[], withUpdatedPath: boolean): MarkedPackage[] {
	const markedPackages: MarkedPackage[] = []

	if (inputFiles.length == 1) {
		return inputFiles[0].settings.fileSettings.markedPackages
	}

	for (let inputFile of inputFiles) {
		if (inputFile.settings.fileSettings.markedPackages) {
			for (let oldMarkedPackages of inputFile.settings.fileSettings.markedPackages) {
				const markedPackage: MarkedPackage = {
					path: withUpdatedPath
						? getUpdatedBlacklistItemPath(inputFile.fileMeta.fileName, oldMarkedPackages.path)
						: oldMarkedPackages.path,
					color: oldMarkedPackages.color
				}
				const equalMarkedPackages = markedPackages.find(x => x.path == markedPackage.path && x.color == markedPackage.color)

				if (!equalMarkedPackages) {
					markedPackages.push(markedPackage)
				}
			}
		}
	}

	return markedPackages
}
