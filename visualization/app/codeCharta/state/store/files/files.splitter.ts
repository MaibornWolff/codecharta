import { setFiles } from "./files.actions"
import { CCAction, FileState } from "../../../codeCharta.model"

export function splitFilesAction(payload: FileState[]): CCAction[] {
	return [setFiles(payload)]
}
