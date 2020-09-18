import { CodeChartaService } from "../codeCharta.service"

export function getUpdatedBlacklistItemPath(fileName: string, path: string) {
	if (isAbsoluteRootPath(path)) {
		return getUpdatedPath(fileName, path)
	}
	return path
}

export function getUpdatedPath(fileName: string, path: string) {
	const length = CodeChartaService.ROOT_PATH.length + 1
	const end = path.length <= length ? "" : `/${path.slice(length)}`
	return `${CodeChartaService.ROOT_PATH}/${fileName}${end}`
}

function isAbsoluteRootPath(path: string) {
	return path.startsWith(`${CodeChartaService.ROOT_PATH}/`)
}
