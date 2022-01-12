import { createSelector } from "../../../angular-redux/createSelector"
import { CcState } from "../../store"
import { focusedNodePathSelector } from "./focusedNodePath.selector"

export const currentFocusedNodePathSelector: (state: CcState) => string | undefined = createSelector(
	[focusedNodePathSelector],
	focusedNodePath => focusedNodePath[0]
)
