import { isDeltaState } from "../../model/files/files.helper"
import { createSelector } from "../angular-redux/createSelector"
import { filesSelector } from "../store/files/files.selector"

export const isDeltaStateSelector = createSelector([filesSelector], files => isDeltaState(files))
