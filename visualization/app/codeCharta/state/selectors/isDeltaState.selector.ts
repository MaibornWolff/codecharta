import { createSelector } from "@ngrx/store"
import { isDeltaState } from "../../model/files/files.helper"
import { filesSelector } from "../../features/fileSelector/stores/files.selectors"

export const isDeltaStateSelector = createSelector(filesSelector, files => isDeltaState(files))
