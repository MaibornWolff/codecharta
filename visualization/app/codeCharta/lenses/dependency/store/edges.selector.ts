import { createSelector } from "@ngrx/store"
import { getVisibleFiles, isPartialState } from "../../../model/files/files.helper"
import { filesSelector } from "../../../stores/fileStore/fileStore.facade"
import { getMergedEdges } from "../../../util/edges/edges.merger"

export const edgesSelector = createSelector(filesSelector, files => getMergedEdges(getVisibleFiles(files), isPartialState(files)))
