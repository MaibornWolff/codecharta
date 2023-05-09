import { createSelector } from "@ngrx/store"
import { isDeltaState } from "../../model/files/files.helper"
import { filesSelector } from "../store/files/files.selector"

export const isDeltaStateSelector = createSelector(filesSelector, files => isDeltaState(files))
