import { ActionReducer } from "@ngrx/store"
import { CcState } from "../../model/codeCharta.model"
import { dependencyLensSource } from "../dependencyLensSource/dependencyLensSource.read.facade"
import { domainLensSource } from "../domainLensSource/domainLensSource.read.facade"
import { domainState } from "../domainState/domainState.read.facade"
import { currentFilesAreSampleFiles, files, isLoadingFile } from "../fileStore/fileStore.facade"
import { mapState } from "../mapState/mapState.read.facade"
import { metricsLensSource } from "../metricsLensSource/metricsLensSource.read.facade"
import { preferences } from "../preferences/preferences.read.facade"
import { sharedView } from "../sharedView/sharedView.read.facade"
import { isSetStateAction } from "./state.actions"
import { _applyPartialState } from "./state.manager"

export const appReducers = {
    metricsLensSource,
    dependencyLensSource,
    domainLensSource,
    domainState,
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
