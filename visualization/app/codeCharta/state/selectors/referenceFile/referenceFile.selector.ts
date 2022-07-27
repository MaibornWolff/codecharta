import { FileSelectionState, FileState } from "../../../model/files/files"
import { createSelector } from "../../angular-redux/createSelector"
import { filesSelector } from "../../store/files/files.selector"

type Selectable = Pick<FileState, "selectedAs">
type SelectableFile<File> = Selectable & { file: File }

export const _getReferenceFile = <File>(fileStates: SelectableFile<File>[]) =>
	fileStates.find(file => file.selectedAs === FileSelectionState.Reference)?.file

export const referenceFileSelector = createSelector([filesSelector], _getReferenceFile)
