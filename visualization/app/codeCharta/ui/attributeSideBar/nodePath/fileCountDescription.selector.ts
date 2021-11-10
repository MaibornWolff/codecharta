import { createSelector } from "../../../state/angular-redux/createSelector"
import { selectedBuildingSelector } from "../../../state/selectors/selectedBuilding.selector"

type BuildingWithFileCountDescription = {
	node?: {
		attributes?: {
			unary?: number
		}
	}
}

export const building2fileCountDescription = (building: BuildingWithFileCountDescription | undefined) => {
	if (!building) return

	const fileCount = building.node?.attributes?.unary ?? 0
	if (fileCount === 0) return "empty"
	if (fileCount === 1) return "1 file"
	return `${fileCount} files`
}

export const fileCountDescriptionSelector = createSelector([selectedBuildingSelector], building2fileCountDescription)
