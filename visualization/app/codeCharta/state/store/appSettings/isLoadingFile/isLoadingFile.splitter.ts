import { IsLoadingFileAction, setIsLoadingFile } from "./isLoadingFile.actions"

export function splitIsLoadingFileAction(payload: boolean): IsLoadingFileAction {
	return setIsLoadingFile(payload)
}
