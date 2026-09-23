import { createAction, props } from "@ngrx/store"
import { RadialFolderValue } from "../../../../model/codeCharta.model"

export const setRadialFolderValue = createAction("SET_RADIAL_FOLDER_VALUE", props<{ value: RadialFolderValue }>())
