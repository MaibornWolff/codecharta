import { createReducer, on } from "@ngrx/store"
import { setLocalFolderPath } from "./localFolderPath.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultLocalFolderPath = ""
export const localFolderPath = createReducer(defaultLocalFolderPath, on(setLocalFolderPath, setState(defaultLocalFolderPath)))
