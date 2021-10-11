import { CodeMapNode, FileMeta } from "../../../codeCharta.model"
import { FileState } from "../../../model/files/files"
import { fileStatesAvailable, getVisibleFileStates, isSingleState, isPartialState, isDeltaState } from "../../../model/files/files.helper"
import { AggregationGenerator } from "../../../util/aggregationGenerator"
import { clone } from "../../../util/clone"
import { NodeDecorator } from "../../../util/nodeDecorator"
import { createSelector } from "../../angular-redux/store"
import { filesSelector } from "../../store/files/files.selector"
import { fileSettingsSelector } from "../../store/fileSettings/fileSettings.selector"
import { metricDataSelector } from "../../store/metricData/metricData.selector"
import { CcState } from "../../store/store"
import { metricNamesSelector } from "./metricNames.selector"
import { getDeltaFile } from "./utils/getDeltaFile"
import { addEdgeMetricsForLeaves } from "./utils/addEdgeMetricsForLeaves"

const accumulatedDataFallback = Object.freeze({
	unifiedMapNode: undefined,
	unifiedFileMeta: undefined
})

export const accumulatedDataSelector: (state: CcState) => { unifiedMapNode: CodeMapNode; unifiedFileMeta: FileMeta } = createSelector(
	[metricDataSelector, filesSelector, fileSettingsSelector, metricNamesSelector],
	(metricData, files, fileSettings, metricNames) => {
		if (!fileStatesAvailable(files) || !metricData.nodeMetricData) return accumulatedDataFallback

		const data = getUndecoratedAccumulatedData(files)
		if (!data || !data.map) return accumulatedDataFallback

		NodeDecorator.decorateMap(data.map, metricData, fileSettings.blacklist)
		addEdgeMetricsForLeaves(data.map, metricNames)
		NodeDecorator.decorateParentNodesWithAggregatedAttributes(data.map, isDeltaState(files), fileSettings.attributeTypes)

		return {
			unifiedMapNode: data.map,
			unifiedFileMeta: data.fileMeta
		}
	}
)

const getUndecoratedAccumulatedData = (files: FileState[]) => {
	// TODO this cloning shouldn't be necessary. When migrating to NgRx
	// we should find and eliminate the responsible side effects
	const visibleFileStates = clone(getVisibleFileStates(files))

	if (isSingleState(files)) {
		return visibleFileStates[0].file
	}
	if (isPartialState(files)) {
		return AggregationGenerator.getAggregationFile(visibleFileStates.map(x => x.file))
	}
	if (isDeltaState(files)) {
		const [reference, comparison] = visibleFileStates
		if (comparison && reference.file.map.name !== comparison.file.map.name) {
			return AggregationGenerator.getAggregationFile(visibleFileStates.map(x => x.file))
		}
		return getDeltaFile(visibleFileStates)
	}
}
