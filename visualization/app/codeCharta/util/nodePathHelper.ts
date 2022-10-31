import { LoadFileService } from "../services/loadFile/loadFile.service"

export function getUpdatedBlacklistItemPath(fileName: string, path: string) {
	if (isAbsoluteRootPath(path)) {
		return getUpdatedPath(fileName, path)
	}
	return path
}

export function getUpdatedPath(fileName: string, path: string) {
	const length = LoadFileService.ROOT_PATH.length + 1
	const end = path.length <= length ? "" : `/${path.slice(length)}`
	return `${LoadFileService.ROOT_PATH}/${fileName}${end}`
}

function isAbsoluteRootPath(path: string) {
	return path.startsWith(`${LoadFileService.ROOT_PATH}/`)
}

export function getParent<T>(hashMap: Map<string, T>, path: string): T {
	do {
		// TODO: Check what happens with Windows paths.
		path = path.slice(0, path.lastIndexOf("/"))

		const node = hashMap.get(path)
		if (node) {
			return node
		}
	} while (path !== LoadFileService.ROOT_PATH && path.length > 0)
}
