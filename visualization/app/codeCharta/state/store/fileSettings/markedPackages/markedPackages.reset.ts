import { CCFile, MarkedPackage } from "../../../../codeCharta.model"
import { SettingsMerger } from "../../../../util/settingsMerger"

export function getMergedMarkedPackages(inputFiles: CCFile[], withUpdatedPath: boolean): MarkedPackage[] {
	let markedPackages: MarkedPackage[] = []

	if (inputFiles.length == 1) {
		return inputFiles[0].settings.fileSettings.markedPackages
	}

	for (let inputFile of inputFiles) {
		if (inputFile.settings.fileSettings.markedPackages) {
			for (let oldMarkedPackages of inputFile.settings.fileSettings.markedPackages) {
				let markedPackage: MarkedPackage = {
					path: withUpdatedPath
						? SettingsMerger.getUpdatedBlacklistItemPath(inputFile.fileMeta.fileName, oldMarkedPackages.path)
						: oldMarkedPackages.path,
					color: oldMarkedPackages.color,
					attributes: oldMarkedPackages.attributes
				}
				const equalMarkedPackages = markedPackages.find(x => x.path == markedPackage.path && x.color == markedPackage.color)

				if (equalMarkedPackages) {
					for (let key in markedPackage.attributes) {
						equalMarkedPackages.attributes[key] = markedPackage.attributes[key]
					}
				} else {
					markedPackages.push(markedPackage)
				}
			}
		}
	}

	return markedPackages
}
