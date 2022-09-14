import { FileSelectionState, FileState } from "../../../model/files/files"
import { createSelector } from "../../angular-redux/createSelector"
import { filesSelector } from "../../store/files/files.selector"

type Selectable = Pick<FileState, "selectedAs">
type SelectableFile<File> = Selectable & { file: File }

export const _getComparisonFile = <File>(fileStates: SelectableFile<File>[]) =>
	fileStates.find(file => file.selectedAs === FileSelectionState.Comparison)?.file

export const comparisonFileSelector = createSelector([filesSelector], _getComparisonFile)
