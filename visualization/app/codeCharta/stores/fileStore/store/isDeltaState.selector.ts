import { createSelector } from "@ngrx/store"
import { isDeltaState } from "../../../model/files/files.helper"
import { filesSelector } from "./files.selector"

export const isDeltaStateSelector = createSelector(filesSelector, files => isDeltaState(files))
