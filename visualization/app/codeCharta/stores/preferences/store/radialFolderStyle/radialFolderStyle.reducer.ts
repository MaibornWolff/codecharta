import { createReducer, on } from "@ngrx/store"
import { RadialFolderStyle } from "../../../../model/codeCharta.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setRadialFolderStyle } from "./radialFolderStyle.actions"

export const defaultRadialFolderStyle: RadialFolderStyle = RadialFolderStyle.Tinted
export const radialFolderStyle = createReducer<RadialFolderStyle>(
    defaultRadialFolderStyle,
    on(setRadialFolderStyle, setState(defaultRadialFolderStyle))
)
