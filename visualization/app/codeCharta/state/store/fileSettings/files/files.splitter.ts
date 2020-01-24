import { FilesAction, setFiles } from "./files.actions"
import { FileState } from "../../../../model/codeCharta.model"

export function splitFilesAction(payload: FileState[]): FilesAction {
	return setFiles(payload)
}
