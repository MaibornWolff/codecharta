import { FilesAction, FilesActions, setFiles } from "./files.actions"
import _ from "lodash"
import { FileState } from "../../../../model/codeCharta.model"

export function files(state: FileState[] = setFiles().payload, action: FilesAction): FileState[] {
	switch (action.type) {
		case FilesActions.SET_FILES:
			return _.cloneDeep(action.payload) //TODO: _.cloneDeep not required for primitives
		default:
			return state
	}
}
