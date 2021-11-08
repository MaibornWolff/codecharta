import { createSelector } from "../../../state/angular-redux/createSelector"
import { selectedBuildingSelector } from "../../../state/selectors/selectedBuilding.selector"

export const fileCountDescriptionSelector = createSelector([selectedBuildingSelector], selectedBuilding => {
	if (!selectedBuilding) return

	const fileCount = selectedBuilding.node?.attributes?.unary ?? 0
	if (fileCount === 0) return "empty"
	if (fileCount === 1) return "1 file"
	return `${fileCount} files`
})
