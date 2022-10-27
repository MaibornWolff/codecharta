import { createSelector } from "../../state/angular-redux/createSelector"
import { visibleFileStatesSelector } from "../../state/selectors/visibleFileStates.selector"
import { CustomConfig, CustomConfigMapSelectionMode, MapNameByChecksum } from "../../model/customConfig/customConfig.api.model"
import { FileSelectionState, FileState } from "../../model/files/files"

export type VisibleFilesBySelectionMode = Pick<CustomConfig, "mapSelectionMode" | "assignedMaps">

export const _getVisibleFilesBySelectionMode = (fileStates: FileState[]): VisibleFilesBySelectionMode => {
	const assignedMaps: MapNameByChecksum = new Map()
	let mapSelectionMode: CustomConfigMapSelectionMode
	for (const { selectedAs, file } of fileStates) {
		mapSelectionMode =
			selectedAs === FileSelectionState.Partial ? CustomConfigMapSelectionMode.MULTIPLE : CustomConfigMapSelectionMode.DELTA
		assignedMaps.set(file.fileMeta.fileChecksum, file.fileMeta.fileName)
	}

	return { mapSelectionMode, assignedMaps }
}

export const visibleFilesBySelectionModeSelector = createSelector([visibleFileStatesSelector], _getVisibleFilesBySelectionMode)
