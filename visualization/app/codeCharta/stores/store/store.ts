import { preferences } from "../preferences/preferences.read.facade"
import { files } from "../fileStore/store/files.reducer"
import { isLoadingFile } from "../fileStore/store/isLoadingFile/isLoadingFile.reducer"
import { currentFilesAreSampleFiles } from "../fileStore/store/currentFilesAreSampleFiles/currentFilesAreSampleFiles.reducer"
import { mapState } from "../mapState/mapState.read.facade"
import { sharedView } from "../sharedView/sharedView.read.facade"
import { metricsLensSource } from "../metricsLensSource/metricsLensSource.read.facade"
import { dependencyLensSource } from "../dependencyLensSource/dependencyLensSource.read.facade"
import { ActionReducer } from "@ngrx/store"
import { CcState } from "../../model/codeCharta.model"
import { isSetStateAction } from "./state.actions"
import { _applyPartialState } from "./state.manager"

/**
 * The ngrx ROOT composition (Slice 15f): the per-home reducer map + the global setState meta-reducer.
 * This is the SOLE store-wiring module — only app.config.ts imports it (enforced by
 * `root-store-is-sole-composer`). The reusable root-state CONTRACT (defaultState + the deep-merge kernel)
 * lives in ./state.manager and the global setState action in ./state.actions, both freely importable.
 */
export const appReducers = {
    metricsLensSource,
    dependencyLensSource,
    preferences,
    mapState,
    sharedView,
    files,
    isLoadingFile,
    currentFilesAreSampleFiles
}

export const setStateMiddleware =
    (reducer: ActionReducer<CcState>): ActionReducer<CcState> =>
    (state, action) => {
        const newState = isSetStateAction(action) ? _applyPartialState({ ...state }, action.value) : state
        return reducer(newState, action)
    }
