import { createAction, props } from "@ngrx/store"

export const setSelectedBuildingId = createAction("SET_SELECTED_BUILDING_ID", props<{ value: number | null }>())
