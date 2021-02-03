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

interface MetaDataTrackingItem {
	mapId: string
	codeChartaApiVersion: string
	creationTime: number
	exportedFileSizeInBytes: number
	statisticsPerLanguage: StatisticsPerLanguage
}

interface StatisticsPerLanguage {
	[languageName: string]: LanguageStatistics
}

interface LanguageStatistics {
	numberOfFiles: number
	maxFilePathDepth: number
	avgFilePathDepth: number
	metrics: {
		[metricName: string]: MetricStatistics
	}
}

interface MetricStatistics {
	min: number
	max: number
	totalSum: number
	numberOfFiles: number
	median: number
	avg: number
}

function isTrackingAllowed(state: State) {
	const singleFileStates = getVisibleFileStates(state.files)

	if (!isStandalone() || !isSingleState(state.files) || singleFileStates.length > 1) {
		return false
	}

	const fileApiVersion = getAsApiVersion(singleFileStates[0].file.fileMeta.apiVersion)
	const supportedApiVersion = getAsApiVersion(APIVersions.ONE_POINT_ONE)

	return (
		fileApiVersion.major > supportedApiVersion.major ||
		(fileApiVersion.major === supportedApiVersion.major && fileApiVersion.minor >= supportedApiVersion.minor)
	)
}

export function trackMapMetaData(state: State) {
	if (!isTrackingAllowed(state)) {
		return
	}

	const singleFileStates = getVisibleFileStates(state.files)
	const fileNodes: CodeMapNode[] = getFileNodes(singleFileStates[0].file.map)
	const fileMeta = singleFileStates[0].file.fileMeta

	const trackingDataItem: MetaDataTrackingItem = {
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

function getFileNodes(node: CodeMapNode): CodeMapNode[] {
	const fileNodes: CodeMapNode[] = []
	for (const { data } of hierarchy(node)) {
		if (data.type === NodeType.FILE) {
			fileNodes.push(data)
		}
	}
	return fileNodes
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

		//TODO: How to initialize automatically?
		if (metricValues[fileLanguage] === undefined) {
			metricValues[fileLanguage] = {}
		}
		if (sumOfFilePathDepths[fileLanguage] === undefined) {
			sumOfFilePathDepths[fileLanguage] = 0
		}

		// Initialize statistics object for unseen metric of language
		if (!Object.prototype.hasOwnProperty.call(statisticsPerLanguage, fileLanguage)) {
			initializeLanguageStatistics(fileNode, statisticsPerLanguage[fileLanguage])
		}

		const currentLanguageStats = statisticsPerLanguage[fileLanguage]
		currentLanguageStats.numberOfFiles += 1

		const currentPathDepth = getPathDepth(fileNode.path)
		sumOfFilePathDepths[fileLanguage] += currentPathDepth
		currentLanguageStats.maxFilePathDepth = Math.max(currentLanguageStats.maxFilePathDepth, currentPathDepth)
		currentLanguageStats.avgFilePathDepth = sumOfFilePathDepths[fileLanguage] / currentLanguageStats.numberOfFiles

		for (const metricName of Object.keys(fileNode.attributes)) {
			const metricStatistics: MetricStatistics = currentLanguageStats.metrics[metricName]

			let valuesOfMetric = metricValues[fileLanguage][metricName]
			if (valuesOfMetric === undefined) {
				valuesOfMetric = []
			}

			const currentMetricValue = fileNode.attributes[metricName]

			// push sorted to calculate the median afterwards
			pushSorted(valuesOfMetric, currentMetricValue)

			metricStatistics.median = getMedian(valuesOfMetric)
			metricStatistics.max = Math.max(metricStatistics.max, currentMetricValue)
			metricStatistics.min = Math.min(metricStatistics.min, currentMetricValue)
			metricStatistics.numberOfFiles += 1
			metricStatistics.totalSum += currentMetricValue
			metricStatistics.avg = metricStatistics.totalSum / metricStatistics.numberOfFiles
		}
	}

	return statisticsPerLanguage
}

function initializeLanguageStatistics(fileNode: CodeMapNode, statisticsCurrentLanguage: LanguageStatistics) {
	const initialPathDepth = getPathDepth(fileNode.path)
	statisticsCurrentLanguage = {
		metrics: {},
		numberOfFiles: 0,
		maxFilePathDepth: initialPathDepth,
		avgFilePathDepth: initialPathDepth
	}

	for (const metricName of Object.keys(fileNode.attributes)) {
		statisticsCurrentLanguage.metrics[metricName] = {
			avg: 0,
			max: fileNode.attributes[metricName],
			median: 0,
			min: fileNode.attributes[metricName],
			numberOfFiles: 0,
			totalSum: 0
		}
	}
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
	attributes?: MetricStatistics
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

	const eventTrackingItem = buildEventTrackingItem(actionType, payload)
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

function buildEventTrackingItem(actionType: string, payload?: any): EventTrackingItem | null {
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
