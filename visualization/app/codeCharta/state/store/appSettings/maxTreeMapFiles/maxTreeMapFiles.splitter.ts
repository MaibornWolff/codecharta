import { MaxTreeMapFilesAction, setMaxTreeMapFiles } from "./maxTreeMapFiles.actions"

export function splitMaxTreeMapFilesAction(payload: number): MaxTreeMapFilesAction {
	return setMaxTreeMapFiles(payload)
}
