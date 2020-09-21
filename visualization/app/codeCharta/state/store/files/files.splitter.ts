import { setFiles } from "./files.actions"
import { FileState } from "../../../model/files/files"

export function splitFilesAction(payload: FileState[]) {
	return [setFiles(payload)]
}
