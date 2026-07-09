import { createSelector } from "@ngrx/store"
import { getVisibleFiles, isPartialState } from "../../../model/files/files.helper"
import { filesSelector } from "../../../stores/fileStore/fileStore.facade"
import { getMergedEdges } from "../../../util/edges/edges.merger"

/**
 * The merged edges of the currently visible files — the dependency lens's edge data (ADR-12), derived
 * DOWNWARD from fileStore (the source of truth for the loaded files, which carry their edges). Slice 15e
 * replaced the former `state.fileSettings.edges` materialized-view slice with this pure selector: edges
 * were never independently mutated (`addEdge`/`removeEdge` were dispatched nowhere) — the store slice was
 * only ever re-set to exactly `getMergedEdges(visibleFiles, isPartialState(files))` by an effect on every
 * file change, so it was derived state, not owned state. The mapState edge-VISIBILITY fold (show in/out)
 * stays OUT of the lens (in codeMap's edgeVisibility selector) so `lens-no-view-state` holds.
 */
export const edgesSelector = createSelector(filesSelector, files => getMergedEdges(getVisibleFiles(files), isPartialState(files)))
