import { createReducer, on } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"
import { setCameraZoomFactor, zoomIn, zoomOut } from "./cameraZoomFactor.actions"
import { setState } from "../../util/setState.reducer.factory"

export const maxZoomFactor = 50
export const minZoomFactor = 0.25
export const zoomStep = 0.25

export const defaultCameraZoomFactor: CcState["appStatus"]["cameraZoomFactor"] = 1
export const cameraZoomFactor = createReducer(
    defaultCameraZoomFactor,
    on(setCameraZoomFactor, setState(defaultCameraZoomFactor)),
    on(zoomIn, state => Math.min(state + zoomStep, maxZoomFactor)),
    on(zoomOut, state => Math.max(state - zoomStep, minZoomFactor))
)
