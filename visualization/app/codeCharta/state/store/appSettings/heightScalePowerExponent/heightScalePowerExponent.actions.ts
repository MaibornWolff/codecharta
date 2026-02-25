import { createAction, props } from "@ngrx/store"

export const setHeightScalePowerExponent = createAction("SET_HEIGHT_SCALE_POWER_EXPONENT", props<{ value: number }>())
