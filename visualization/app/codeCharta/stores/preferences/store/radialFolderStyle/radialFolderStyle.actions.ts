import { createAction, props } from "@ngrx/store"
import { RadialFolderStyle } from "../../../../model/codeCharta.model"

export const setRadialFolderStyle = createAction("SET_RADIAL_FOLDER_STYLE", props<{ value: RadialFolderStyle }>())
