function getBuildingAreas(childrenAreaValue:any[], smallestDelta: number, minimumBuildingSize: number){

	return childrenAreaValue.map(element => {
		const buildingArea = (element/smallestDelta) * minimumBuildingSize
		return buildingArea
	})

}

function calculateMedian(childrenAreaValue:any[], smallestDelta: number, minimumBuildingSize: number){

	const buildingAreas = getBuildingAreas(childrenAreaValue, smallestDelta, minimumBuildingSize)

	if(buildingAreas.length ===0) return 0;

	buildingAreas.sort(function(a,b){
		return a-b;
	});

	const middle = Math.floor(buildingAreas.length / 2);

	if (buildingAreas.length % 2)
		return buildingAreas[middle];

	return (buildingAreas[middle - 1] + buildingAreas[middle]) / 2;
}

export function calculatePadding(childrenAreaValue:any[], smallestDelta: number, minimumBuildingSize: number, padding:number){
	const medianBuildingSize = calculateMedian(childrenAreaValue, smallestDelta, minimumBuildingSize)
	return Math.round(Math.sqrt(medianBuildingSize) * padding/100)

}
