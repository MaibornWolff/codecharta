import { visibleFileStatesSelector } from "../../state/selectors/visibleFileStates.selector"
import { CustomConfig, CustomConfigMapSelectionMode, MapNamesByChecksum } from "../../model/customConfig/customConfig.api.model"
import { FileSelectionState, FileState } from "../../model/files/files"
import { createSelector } from "@ngrx/store"

export type VisibleFilesBySelectionMode = Pick<CustomConfig, "mapSelectionMode" | "assignedMaps">

export const _getVisibleFilesBySelectionMode = (fileStates: FileState[]): VisibleFilesBySelectionMode => {
    const assignedMaps: MapNamesByChecksum = new Map()
    let mapSelectionMode: CustomConfigMapSelectionMode
    for (const { selectedAs, file } of fileStates) {
        mapSelectionMode =
            selectedAs === FileSelectionState.Partial ? CustomConfigMapSelectionMode.MULTIPLE : CustomConfigMapSelectionMode.DELTA
        assignedMaps.set(file.fileMeta.fileChecksum, file.fileMeta.fileName)
    }

    return { mapSelectionMode, assignedMaps }
}

export const visibleFilesBySelectionModeSelector = createSelector(visibleFileStatesSelector, _getVisibleFilesBySelectionMode)
