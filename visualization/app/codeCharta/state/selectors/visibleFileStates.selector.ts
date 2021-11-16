import { createSelector } from "../angular-redux/store"
import { getVisibleFileStates } from "../../model/files/files.helper"
import { filesSelector } from "../store/files/files.selector"

export const visibleFileStatesSelector = createSelector([filesSelector], getVisibleFileStates)
