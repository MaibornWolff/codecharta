import { createReducer, on } from "@ngrx/store"
import { RadialFolderValue } from "../../../../model/codeCharta.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setRadialFolderValue } from "./radialFolderValue.actions"

export const defaultRadialFolderValue: RadialFolderValue = RadialFolderValue.Max
export const radialFolderValue = createReducer<RadialFolderValue>(
    defaultRadialFolderValue,
    on(setRadialFolderValue, setState(defaultRadialFolderValue))
)
