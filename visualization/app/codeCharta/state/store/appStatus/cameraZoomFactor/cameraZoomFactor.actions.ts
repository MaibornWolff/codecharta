import { createAction, props } from "@ngrx/store"

export const setCameraZoomFactor = createAction("SET_CAMERA_ZOOM", props<{ value: number }>())
export const zoomIn = createAction("ZOOM_IN")
export const zoomOut = createAction("ZOOM_OUT")
