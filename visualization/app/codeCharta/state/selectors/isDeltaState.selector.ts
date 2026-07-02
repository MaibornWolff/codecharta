import { createSelector } from "@ngrx/store"
import { isDeltaState } from "../../model/files/files.helper"
import { filesSelector } from "../../fileStore/store/files.selector"

export const isDeltaStateSelector = createSelector(filesSelector, files => isDeltaState(files))
