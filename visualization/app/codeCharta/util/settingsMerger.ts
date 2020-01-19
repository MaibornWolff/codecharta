import { CCFile, FileSettings, MarkedPackage } from "../codeCharta.model"
import { CodeChartaService } from "../codeCharta.service"

export class SettingsMerger {
	private static markedPackages: MarkedPackage[] = []

	public static getMergedFileSettings(inputFiles: CCFile[], withUpdatedPath: boolean = false): FileSettings {
		if (inputFiles.length == 1) {
			return inputFiles[0].settings.fileSettings ? inputFiles[0].settings.fileSettings : null
		}

		this.resetVariables()

		for (let inputFile of inputFiles) {
			this.setMarkedPackage(inputFile, withUpdatedPath)
		}
		return this.getNewFileSettings()
	}

	private static setMarkedPackage(inputFile: CCFile, withUpdatedPath: boolean) {
		if (inputFile.settings.fileSettings.markedPackages) {
			for (let oldMarkedPackages of inputFile.settings.fileSettings.markedPackages) {
				let markedPackage: MarkedPackage = {
					path: withUpdatedPath
						? this.getUpdatedBlacklistItemPath(inputFile.fileMeta.fileName, oldMarkedPackages.path)
						: oldMarkedPackages.path,
					color: oldMarkedPackages.color,
					attributes: oldMarkedPackages.attributes
				}
				const equalMarkedPackages = this.markedPackages.find(x => x.path == markedPackage.path && x.color == markedPackage.color)

				if (equalMarkedPackages) {
					for (let key in markedPackage.attributes) {
						equalMarkedPackages.attributes[key] = markedPackage.attributes[key]
					}
				} else {
					this.markedPackages.push(markedPackage)
				}
			}
		}
	}

	public static getUpdatedBlacklistItemPath(fileName: string, path: string): string {
		if (this.isAbsoluteRootPath(path)) {
			return this.getUpdatedPath(fileName, path)
		}
		return path
	}

	private static isAbsoluteRootPath(path: string): boolean {
		return path.startsWith(CodeChartaService.ROOT_PATH + "/")
	}

	private static getNewFileSettings(): FileSettings {
		return {
			markedPackages: this.markedPackages
		} as FileSettings
	}

	public static getUpdatedPath(fileName: string, path: string): string {
		const folderArray = path.split("/")
		folderArray.splice(2, 0, fileName)
		return folderArray.join("/")
	}

	private static resetVariables() {
		this.markedPackages = []
	}
}
