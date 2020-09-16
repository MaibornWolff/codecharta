import { CodeChartaService } from "../codeCharta.service"

export function getUpdatedBlacklistItemPath(fileName: string, path: string) {
	if (isAbsoluteRootPath(path)) {
		return getUpdatedPath(fileName, path)
	}
	return path
}

export function getUpdatedPath(fileName: string, path: string) {
	const folderArray = path.split("/")
	folderArray.splice(2, 0, fileName)
	return folderArray.join("/")
}

function isAbsoluteRootPath(path: string) {
	return path.startsWith(`${CodeChartaService.ROOT_PATH}/`)
}
