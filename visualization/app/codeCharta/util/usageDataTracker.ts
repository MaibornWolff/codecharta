"use strict"

import { getVisibleFileStates, isSingleState } from "../model/files/files.helper"
import { CodeChartaStorage } from "./codeChartaStorage"
import { CodeMapNode, NodeType, State } from "../codeCharta.model"
import { isStandalone } from "./envDetector"
import { isActionOfType } from "./reduxHelper"
import { AreaMetricActions } from "../state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { HeightMetricActions } from "../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { ColorMetricActions } from "../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { ColorRangeActions } from "../state/store/dynamicSettings/colorRange/colorRange.actions"
import { BlacklistActions } from "../state/store/fileSettings/blacklist/blacklist.actions"
import { InvertColorRangeActions } from "../state/store/appSettings/invertColorRange/invertColorRange.actions"
import { FocusedNodePathActions } from "../state/store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import md5 from "md5"
import { APIVersions } from "../codeCharta.api.model"
import { getAsApiVersion } from "./fileValidator"
import { hierarchy } from "d3-hierarchy"
import { getMedian, pushSorted } from "./nodeDecorator"

interface TrackingDataItem {
	mapId: string
	codeChartaApiVersion: string
	creationTime: number
	exportedFileSizeInBytes: number
	statisticsPerLanguage: StatisticsPerLanguage
}

interface MetricStatisticsOverall {
	[metricName: string]: TrackingDataMetricItem
}

interface StatisticsPerLanguage {
	[languageName: string]: {
		numberOfFiles: number
		maxFilePathDepth: number
		avgFilePathDepth: number
		metrics: {
			[metricName: string]: TrackingDataMetricItem
		}
	}
}

interface TrackingDataMetricItem {
	min: number
	max: number
	totalSum: number
	numberOfFiles: number
	median: number
	avg: number
}

function isTrackingAllowed(state: State) {
	if (!isStandalone() || !isSingleState(state.files) || getVisibleFileStates(state.files).length > 1) {
		return false
	}

	const singleFileStates = getVisibleFileStates(state.files)
	const fileMeta = singleFileStates[0].file.fileMeta
	const fileApiVersion = getAsApiVersion(fileMeta.apiVersion)

	const apiVersionOneThree = getAsApiVersion(APIVersions.ONE_POINT_ONE)
	return (
		fileApiVersion.major > apiVersionOneThree.major ||
		(fileApiVersion.major === apiVersionOneThree.major && fileApiVersion.minor >= apiVersionOneThree.minor)
	)
}

export function trackMetaUsageData(state: State) {
	if (!isTrackingAllowed(state)) {
		return
	}

	const singleFileStates = getVisibleFileStates(state.files)

	const fileNodes: CodeMapNode[] = []
	for (const { data } of hierarchy(singleFileStates[0].file.map)) {
		if (data.type === NodeType.FILE) {
			fileNodes.push(data)
		}
	}

	const fileMeta = singleFileStates[0].file.fileMeta

	const trackingDataItem: TrackingDataItem = {
		mapId: fileMeta.fileChecksum,
		codeChartaApiVersion: fileMeta.apiVersion,
		creationTime: Date.now(),
		exportedFileSizeInBytes: fileMeta.exportedFileSize,
		statisticsPerLanguage: mapStatisticsPerLanguage(fileNodes)
	}

	const fileStorage = new CodeChartaStorage()

	try {
		fileStorage.setItem(`usageData/${trackingDataItem.mapId}-meta`, JSON.stringify(trackingDataItem))
	} catch {
		// ignore it
	}
}

function mapStatisticsPerLanguage(fileNodes: CodeMapNode[]): StatisticsPerLanguage {
	const statisticsPerLanguage: StatisticsPerLanguage = {}
	const sumOfFilePathDepths: { [languageName: string]: number } = {}
	const metricValues: { [languageName: string]: { [metricName: string]: number[] } } = {}

	for (const fileNode of fileNodes) {
		const fileLanguage = getFileExtension(fileNode.name)
		if (fileLanguage === null) {
			continue
		}

		if (metricValues[fileLanguage] === undefined) {
			metricValues[fileLanguage] = {}
		}
		if (sumOfFilePathDepths[fileLanguage] === undefined) {
			sumOfFilePathDepths[fileLanguage] = 0
		}

		// Initialize statistics object for unseen metric of language
		if (!Object.prototype.hasOwnProperty.call(statisticsPerLanguage, fileLanguage)) {
			const initialPathDepth = getPathDepth(fileNode.path)
			statisticsPerLanguage[fileLanguage] = {
				metrics: {},
				numberOfFiles: 0,
				maxFilePathDepth: initialPathDepth,
				avgFilePathDepth: initialPathDepth
			}

			for (const metricName of Object.keys(fileNode.attributes)) {
				statisticsPerLanguage[fileLanguage].metrics[metricName] = {
					avg: 0,
					max: fileNode.attributes[metricName],
					median: 0,
					min: fileNode.attributes[metricName],
					numberOfFiles: 0,
					totalSum: 0
				}
			}
		}

		statisticsPerLanguage[fileLanguage].numberOfFiles += 1

		const currentPathDepth = getPathDepth(fileNode.path)
		sumOfFilePathDepths[fileLanguage] += currentPathDepth
		statisticsPerLanguage[fileLanguage].maxFilePathDepth = Math.max(
			statisticsPerLanguage[fileLanguage].maxFilePathDepth,
			currentPathDepth
		)
		statisticsPerLanguage[fileLanguage].avgFilePathDepth =
			sumOfFilePathDepths[fileLanguage] / statisticsPerLanguage[fileLanguage].numberOfFiles

		for (const metricName of Object.keys(fileNode.attributes)) {
			const metricStatistics: TrackingDataMetricItem = statisticsPerLanguage[fileLanguage].metrics[metricName]

			if (metricValues[fileLanguage][metricName] === undefined) {
				metricValues[fileLanguage][metricName] = []
			}
			// push sorted to calculate the median afterwards
			pushSorted(metricValues[fileLanguage][metricName], fileNode.attributes[metricName])

			metricStatistics.median = getMedian(metricValues[fileLanguage][metricName])
			metricStatistics.max = Math.max(metricStatistics.max, fileNode.attributes[metricName])
			metricStatistics.min = Math.min(metricStatistics.min, fileNode.attributes[metricName])
			metricStatistics.numberOfFiles += 1
			metricStatistics.totalSum += fileNode.attributes[metricName]
			metricStatistics.avg = metricStatistics.totalSum / metricStatistics.numberOfFiles
		}
	}

	return statisticsPerLanguage
}

function getPathDepth(path: string): number {
	return path.split("/").length
}

function getFileExtension(filePath: string): string {
	const lastDotPosition = filePath.lastIndexOf(".")
	return lastDotPosition !== -1 ? filePath.slice(lastDotPosition + 1) : null
}

interface SettingChangedEventPayload {
	eventName: string
	newValue: any
}

interface NodeInteractionEventPayload {
	eventName: string
	id: string
	type?: string
	nodeType?: string
	attributes?: MetricStatisticsOverall
}

interface EventTrackingItem {
	eventType: string
	eventTime: number
	payload: SettingChangedEventPayload | NodeInteractionEventPayload
}

export function trackEventUsageData(actionType: string, state: State, payload?: any) {
	if (
		!isTrackingAllowed(state) ||
		(!isActionOfType(actionType, AreaMetricActions) &&
			!isActionOfType(actionType, HeightMetricActions) &&
			!isActionOfType(actionType, ColorMetricActions) &&
			!isActionOfType(actionType, ColorRangeActions) &&
			!isActionOfType(actionType, InvertColorRangeActions) &&
			!isActionOfType(actionType, BlacklistActions) &&
			!isActionOfType(actionType, FocusedNodePathActions))
	) {
		return
	}

	const eventTrackingItem = buildEvenTrackingItem(actionType, payload)
	if (eventTrackingItem === null) {
		return
	}

	const { fileChecksum } = getVisibleFileStates(state.files)[0].file.fileMeta
	const fileStorage = new CodeChartaStorage()

	let appendedEvents = ""
	try {
		appendedEvents = fileStorage.getItem(`usageData/${fileChecksum}-events`)
	} catch {
		// ignore, it no events item exists
	}

	try {
		if (appendedEvents.length > 0) {
			appendedEvents += "\n"
		}
		fileStorage.setItem(`usageData/${fileChecksum}-events`, appendedEvents + JSON.stringify(eventTrackingItem))
	} catch {
		// ignore tracking errors
	}
}

function buildEvenTrackingItem(actionType: string, payload?: any): EventTrackingItem | null {
	if (isSettingChangedEvent(actionType)) {
		return {
			eventType: "setting_changed",
			eventTime: Date.now(),
			payload: {
				eventName: actionType,
				newValue: payload
			}
		}
	}

	if (isActionOfType(actionType, BlacklistActions)) {
		return {
			eventType: "node_interaction",
			eventTime: Date.now(),
			payload: {
				eventName: actionType,
				id: md5(payload.path),
				type: payload.type,
				nodeType: payload.nodeType,
				attributes: payload.attributes
			}
		}
	}

	if (isActionOfType(actionType, FocusedNodePathActions) && payload !== "") {
		return {
			eventType: "node_interaction",
			eventTime: Date.now(),
			payload: {
				eventName: actionType,
				id: md5(payload)
			}
		}
	}

	return null
}

function isSettingChangedEvent(actionType: string) {
	return (
		isActionOfType(actionType, AreaMetricActions) ||
		isActionOfType(actionType, HeightMetricActions) ||
		isActionOfType(actionType, ColorMetricActions) ||
		isActionOfType(actionType, ColorRangeActions) ||
		isActionOfType(actionType, InvertColorRangeActions)
	)
}
