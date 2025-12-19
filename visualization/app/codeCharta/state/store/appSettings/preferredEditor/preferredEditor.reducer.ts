import { createReducer, on } from "@ngrx/store"
import { PreferredEditor } from "../../../../codeCharta.model"
import { setPreferredEditor } from "./preferredEditor.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultPreferredEditor = PreferredEditor.VSCode
export const preferredEditor = createReducer(defaultPreferredEditor, on(setPreferredEditor, setState(defaultPreferredEditor)))
