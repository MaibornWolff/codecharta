import { setFiles } from "./files.actions"
import { CCAction } from "../../../model/codeCharta.model"
import { Files } from "../../../model/files"

export function splitFilesAction(payload: Files): CCAction[] {
	return [setFiles(payload)]
}
