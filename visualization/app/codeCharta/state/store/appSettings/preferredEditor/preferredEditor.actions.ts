import { createAction, props } from "@ngrx/store"
import { PreferredEditor } from "../../../../codeCharta.model"

export const setPreferredEditor = createAction("SET_PREFERRED_EDITOR", props<{ value: PreferredEditor }>())
