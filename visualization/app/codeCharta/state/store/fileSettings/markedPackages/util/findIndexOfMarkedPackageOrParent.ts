import { MarkedPackage } from "../../../../../codeCharta.model"

/** @return index of exact match if there is an exact match. Otherwise return index of parent or -1  */
export const findIndexOfMarkedPackageOrParent = (markedPackages: MarkedPackage[], nodePath: string) => {
	const indexOfNodePath = markedPackages.findIndex(mp => mp.path === nodePath)
	if (indexOfNodePath !== -1) return indexOfNodePath

	let indexOfLongestParent = -1
	for (let loopIndex = 0; loopIndex < markedPackages.length; loopIndex++) {
		const markedPackage = markedPackages[loopIndex]
		if (
			nodePath.startsWith(markedPackage.path) &&
			(indexOfLongestParent === -1 || markedPackages[indexOfLongestParent].path.length < markedPackage.path.length)
		)
			indexOfLongestParent = loopIndex
	}

	return indexOfLongestParent
}
