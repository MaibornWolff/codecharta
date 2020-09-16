import { setIsLoadingFile } from "./isLoadingFile.actions"

export function splitIsLoadingFileAction(payload: boolean) {
	return setIsLoadingFile(payload)
}
