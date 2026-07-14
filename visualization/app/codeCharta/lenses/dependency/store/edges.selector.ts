import { createSelector } from "@ngrx/store"
import { getCCFiles, isPartialState } from "../../../model/files/files.helper"
import { visibleFileStatesSelector } from "../../../stores/fileStore/fileStore.facade"
import { getMergedEdges } from "../../../util/edges/edges.merger"

export const edgesSelector = createSelector(visibleFileStatesSelector, visibleFileStates =>
    getMergedEdges(getCCFiles(visibleFileStates), isPartialState(visibleFileStates))
)
