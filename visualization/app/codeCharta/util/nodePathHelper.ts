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

export function getParent<T>(hashMap: Map<string, T>, path: string): T {
	do {
		// TODO: Check what happens with Windows paths.
		path = path.slice(0, path.lastIndexOf("/"))

		const node = hashMap.get(path)
		if (node) {
			return node
		}
	} while (path !== CodeChartaService.ROOT_PATH && path.length)
}
