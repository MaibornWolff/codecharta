import { setFiles } from "./files.actions"
import { CCAction } from "../../../codeCharta.model"
import { FileState } from "../../../model/files/files"

export function splitFilesAction(payload: FileState[]): CCAction[] {
	return [setFiles(payload)]
}
