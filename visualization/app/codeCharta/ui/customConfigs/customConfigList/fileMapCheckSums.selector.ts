import { CcState } from "../../../state/store/store"
import { createSelector } from "../../../state/angular-redux/createSelector"
import { visibleFileStatesSelector } from "../../../state/selectors/visibleFileStates.selector"
import { CustomConfigMapSelectionMode } from "../../../model/customConfig/customConfig.api.model"
import { FileSelectionState, FileState } from "../../../model/files/files"

export const _mapCheckSumsByMapSelectionMode = (fileStates: FileState[]) => {
	const mapCheckSums: string[] = []
	const mapCheckSumsByMapSelectionMode = new Map<CustomConfigMapSelectionMode, string[]>()

	for (const { selectedAs, file } of fileStates) {
		mapCheckSums.push(file.fileMeta.fileChecksum)
		mapCheckSumsByMapSelectionMode.set(
			selectedAs === FileSelectionState.Partial ? CustomConfigMapSelectionMode.MULTIPLE : CustomConfigMapSelectionMode.DELTA,
			mapCheckSums
		)
	}

	return mapCheckSumsByMapSelectionMode
}

export const fileMapCheckSumsSelector: (state: CcState) => Map<CustomConfigMapSelectionMode, string[]> = createSelector(
	[visibleFileStatesSelector],
	_mapCheckSumsByMapSelectionMode
)
