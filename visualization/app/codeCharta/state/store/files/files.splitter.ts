import { FilesAction, setFiles } from "./files.actions"
import { CCAction, FileState } from "../../../model/codeCharta.model"
import { Files } from "../../../model/files"

export function splitFilesAction(payload: Files): CCAction[] {
	return [setFiles(payload)]
}
