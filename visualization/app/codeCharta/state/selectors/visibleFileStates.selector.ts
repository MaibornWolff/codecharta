import { getVisibleFileStates } from "../../model/files/files.helper"
import { createSelector } from "../angular-redux/createSelector"
import { filesSelector } from "../store/files/files.selector"

export const visibleFileStatesSelector = createSelector([filesSelector], getVisibleFileStates)
