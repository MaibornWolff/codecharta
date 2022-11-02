function getBuildingAreas(childrenAreaValue: number[], smallestDelta: number, minimumBuildingArea: number) {
	return childrenAreaValue.map(element => {
		return (element / smallestDelta) * minimumBuildingArea
	})
}

function calculateMedian(childrenAreaValues: number[], smallestDelta: number, minimumBuildingArea: number) {
	const buildingAreas = getBuildingAreas(childrenAreaValues, smallestDelta, minimumBuildingArea)

	if (buildingAreas.length === 0) {
		return 0
	}

	buildingAreas.sort(function (a, b) {
		return a - b
	})

	const middle = Math.floor(buildingAreas.length / 2) - 1

	if (buildingAreas.length % 2 !== 0) {
		return buildingAreas[middle + 1]
	}

	return (buildingAreas[middle] + buildingAreas[middle + 1]) / 2
}

export function calculatePaddingBasedOnBuildingArea(
	childrenAreaValues: number[],
	smallestDelta: number,
	minimumBuildingArea: number,
	padding: number
	//paddingFactor : number
) {
	const medianBuildingArea = calculateMedian(childrenAreaValues, smallestDelta, minimumBuildingArea)
	return Math.ceil((padding / Math.sqrt(medianBuildingArea)) * Math.sqrt(minimumBuildingArea))
}
