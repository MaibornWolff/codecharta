import { CodeMapNode, FileMeta } from "../../../codeCharta.model"
import { FileState } from "../../../model/files/files"
import { fileStatesAvailable, isPartialState, isDeltaState, haveEqualRootNames } from "../../../model/files/files.helper"
import { AggregationGenerator } from "../../../util/aggregationGenerator"
import { clone } from "../../../util/clone"
import { NodeDecorator } from "../../../util/nodeDecorator"
import { createSelector } from "../../angular-redux/store"
import { CcState } from "../../store/store"
import { metricNamesSelector } from "./metricData/metricNames.selector"
import { getDeltaFile } from "./utils/getDeltaFile"
import { addEdgeMetricsForLeaves } from "./utils/addEdgeMetricsForLeaves"
import { blacklistSelector } from "../../store/fileSettings/blacklist/blacklist.selector"
import { attributeTypesSelector } from "../../store/fileSettings/attributeTypes/attributeTypes.selector"
import { visibleFileStatesSelector } from "../visibleFileStates.selector"
import { metricDataSelector } from "./metricData/metricData.selector"

const accumulatedDataFallback = Object.freeze({
	unifiedMapNode: undefined,
	unifiedFileMeta: undefined
})

export type AccumulatedData = { unifiedMapNode: CodeMapNode; unifiedFileMeta: FileMeta }

export const accumulatedDataSelector: (state: CcState) => AccumulatedData = createSelector(
	[metricDataSelector, visibleFileStatesSelector, attributeTypesSelector, blacklistSelector, metricNamesSelector],
	(metricData, fileStates, attributeTypes, blacklist, metricNames) => {
		if (!fileStatesAvailable(fileStates) || !metricData.nodeMetricData) {
			return accumulatedDataFallback
		}

		const data = getUndecoratedAccumulatedData(fileStates)

		if (!data || !data.map) {
			return accumulatedDataFallback
		}

		NodeDecorator.decorateMap(data.map, metricData, blacklist)
		addEdgeMetricsForLeaves(data.map, metricNames)
		NodeDecorator.decorateParentNodesWithAggregatedAttributes(data.map, isDeltaState(fileStates), attributeTypes)

		return {
			unifiedMapNode: data.map,
			unifiedFileMeta: data.fileMeta
		}
	}
)

const getUndecoratedAccumulatedData = (fileStates: FileState[]) => {
	// TODO this cloning shouldn't be necessary. When migrating to NgRx
	// we should find and eliminate the responsible side effects
	const visibleFileStates = clone(fileStates)

	if (isPartialState(fileStates)) {
		return AggregationGenerator.getAggregationFile(visibleFileStates.map(x => x.file))
	}
	if (isDeltaState(fileStates)) {
		const [reference, comparison] = visibleFileStates

		if (!comparison || !haveEqualRootNames(reference.file, comparison.file)) {
			return AggregationGenerator.getAggregationFile(visibleFileStates.map(x => x.file))
		}
		return getDeltaFile(visibleFileStates)
	}
}
