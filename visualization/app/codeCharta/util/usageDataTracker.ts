"use strict"

import { getVisibleFileStates, isSingleState } from "../model/files/files.helper"
import { CodeMapNode, NodeType, State } from "../codeCharta.model"
import { isStandalone } from "./envDetector"
import { isActionOfType } from "./reduxHelper"
import { AreaMetricActions } from "../state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { HeightMetricActions } from "../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { ColorMetricActions } from "../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { BlacklistActions } from "../state/store/fileSettings/blacklist/blacklist.actions"
import { FocusedNodePathActions } from "../state/store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import md5 from "md5"
import { APIVersions } from "../codeCharta.api.model"
import { getAsApiVersion } from "./fileValidator"
import { hierarchy } from "d3-hierarchy"
import { getMedian, pushSorted } from "./nodeDecorator"
import { RangeSliderController } from "../ui/rangeSlider/rangeSlider.component"
import { ColorRangeActions } from "../state/store/dynamicSettings/colorRange/colorRange.actions"

interface MetaDataTrackingItem {
	mapId: string
	codeChartaApiVersion: string
	creationTime: number
	exportedFileSizeInBytes: number
	statisticsPerLanguage: StatisticsPerLanguage
	repoCreationDate: string
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
	firstQuantile: number
	median: number
	thirdQuantile: number
	max: number
	outliers: number[]
	variance: number
	standardDeviation: number
	variationCoefficient: number
	totalSum: number
	numberOfFiles: number
	avg: number
	metricValues: number[]
}

export const TRACKING_DATA_LOCAL_STORAGE_ELEMENT = "CodeCharta::usageData"

function isTrackingAllowed(state: State) {
	const singleFileStates = getVisibleFileStates(state.files)

	if (!isStandalone() || !isSingleState(state.files) || singleFileStates.length > 1) {
		return false
	}

	const fileApiVersion = getAsApiVersion(singleFileStates[0].file.fileMeta.apiVersion)
	const supportedApiVersion = getAsApiVersion(APIVersions.ONE_POINT_ZERO)

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
		statisticsPerLanguage: mapStatisticsPerLanguage(fileNodes),
		repoCreationDate: fileMeta.repoCreationDate
	}

	// Make sure that only files within usageData can be read
	const fileChecksum = trackingDataItem.mapId.replace(/\//g, "")

	try {
		localStorage.setItem(`${TRACKING_DATA_LOCAL_STORAGE_ELEMENT}/${fileChecksum}-meta`, JSON.stringify(trackingDataItem))
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
	const unsortedMetricValues: { [languageName: string]: { [metricName: string]: number[] } } = {}

	for (const fileNode of fileNodes) {
		const fileLanguage = getFileExtension(fileNode.name)
		if (fileLanguage === null) {
			continue
		}

		//TODO: How to initialize automatically?
		if (metricValues[fileLanguage] === undefined) {
			metricValues[fileLanguage] = {}
		}
		if (unsortedMetricValues[fileLanguage] === undefined) {
			unsortedMetricValues[fileLanguage] = {}
		}
		if (sumOfFilePathDepths[fileLanguage] === undefined) {
			sumOfFilePathDepths[fileLanguage] = 0
		}

		// Initialize statistics object for unseen metric of language
		if (!Object.prototype.hasOwnProperty.call(statisticsPerLanguage, fileLanguage)) {
			initializeLanguageStatistics(fileNode, statisticsPerLanguage, fileLanguage)
		}

		const currentLanguageStats = statisticsPerLanguage[fileLanguage]
		currentLanguageStats.numberOfFiles += 1

		const currentPathDepth = getPathDepth(fileNode.path)
		sumOfFilePathDepths[fileLanguage] += currentPathDepth
		currentLanguageStats.maxFilePathDepth = Math.max(currentLanguageStats.maxFilePathDepth, currentPathDepth)
		currentLanguageStats.avgFilePathDepth = sumOfFilePathDepths[fileLanguage] / currentLanguageStats.numberOfFiles

		for (const metricName of Object.keys(fileNode.attributes)) {
			const metricStatistics: MetricStatistics = currentLanguageStats.metrics[metricName]
			if (metricStatistics === undefined) {
				// Skip if file has different set of metrics compared to other files of the same language
				continue
			}

			if (metricValues[fileLanguage][metricName] === undefined) {
				metricValues[fileLanguage][metricName] = []
			}
			if (unsortedMetricValues[fileLanguage][metricName] === undefined) {
				unsortedMetricValues[fileLanguage][metricName] = []
			}

			const valuesOfMetric = metricValues[fileLanguage][metricName]
			const unsortedValuesOfMetric = unsortedMetricValues[fileLanguage][metricName]
			const currentMetricValue = fileNode.attributes[metricName]
			pushSorted(valuesOfMetric, currentMetricValue)
			unsortedValuesOfMetric.push(currentMetricValue)

			metricStatistics.median = getMedian(valuesOfMetric)
			metricStatistics.max = Math.max(metricStatistics.max, currentMetricValue)
			metricStatistics.min = Math.min(metricStatistics.min, currentMetricValue)
			metricStatistics.numberOfFiles += 1
			metricStatistics.totalSum += currentMetricValue
			metricStatistics.avg = metricStatistics.totalSum / metricStatistics.numberOfFiles

			metricStatistics.variance = getVariance(valuesOfMetric)
			metricStatistics.standardDeviation = Math.sqrt(metricStatistics.variance)
			metricStatistics.variationCoefficient = metricStatistics.standardDeviation / metricStatistics.avg

			metricStatistics.metricValues = unsortedValuesOfMetric

			let valuesFirstHalf: number[]
			let valuesSecondHalf: number[]

			if (valuesOfMetric.length % 2 === 0) {
				valuesFirstHalf = valuesOfMetric.slice(0, valuesOfMetric.length / 2)
				valuesSecondHalf = valuesOfMetric.slice(valuesOfMetric.length / 2, valuesOfMetric.length)
			} else {
				valuesFirstHalf = valuesOfMetric.slice(0, valuesOfMetric.length / 2)
				valuesSecondHalf = valuesOfMetric.slice(valuesOfMetric.length / 2 + 1, valuesOfMetric.length)
			}

			metricStatistics.firstQuantile = getMedian(valuesFirstHalf)
			metricStatistics.thirdQuantile = getMedian(valuesSecondHalf)

			const interQuartileRange = metricStatistics.thirdQuantile - metricStatistics.firstQuantile
			const upperOutlierBound = metricStatistics.thirdQuantile + 1.5 * interQuartileRange

			metricStatistics.outliers = valuesOfMetric.filter(function (value) {
				return value > upperOutlierBound
			})
		}
	}

	return statisticsPerLanguage
}

function getVariance(array) {
	const n = array.length
	const mean = array.reduce((a, b) => a + b) / n
	return array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
}

function initializeLanguageStatistics(fileNode: CodeMapNode, statisticsPerLanguage: StatisticsPerLanguage, fileLanguage: string) {
	const initialPathDepth = getPathDepth(fileNode.path)
	const statisticsCurrentLanguage = (statisticsPerLanguage[fileLanguage] = {
		metrics: {},
		numberOfFiles: 0,
		maxFilePathDepth: initialPathDepth,
		avgFilePathDepth: initialPathDepth
	})

	for (const metricName of Object.keys(fileNode.attributes)) {
		statisticsCurrentLanguage.metrics[metricName] = {
			avg: 0,
			max: fileNode.attributes[metricName],
			median: 0,
			min: fileNode.attributes[metricName],
			numberOfFiles: 0,
			totalSum: 0,
			firstQuantile: 0,
			thirdQuantile: 0,
			variance: 0,
			standardDeviation: 0,
			variationCoefficient: 0,
			outliers: []
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
	newValue: unknown
}

interface NodeInteractionEventPayload {
	eventName: string
	id: string
	type?: string
	nodeType?: string
	attributes?: MetricStatistics
}

interface EventTrackingItem {
	mapId: string
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
			!isActionOfType(actionType, BlacklistActions) &&
			!isActionOfType(actionType, FocusedNodePathActions) &&
			![RangeSliderController.COLOR_RANGE_FROM_UPDATED, RangeSliderController.COLOR_RANGE_TO_UPDATED].includes(actionType))
	) {
		return
	}

	const singleFileStates = getVisibleFileStates(state.files)
	const fileMeta = singleFileStates[0].file.fileMeta

	const eventTrackingItem = buildEventTrackingItem(fileMeta.fileChecksum, actionType, payload)
	if (eventTrackingItem === null) {
		return
	}

	// Make sure that only files within usageData can be read
	const fileChecksum = getVisibleFileStates(state.files)[0].file.fileMeta.fileChecksum.replace(/\//g, "")

	let appendedEvents = ""
	try {
		appendedEvents = localStorage.getItem(`${TRACKING_DATA_LOCAL_STORAGE_ELEMENT}/${fileChecksum}-events`)
	} catch {
		// ignore, it no events item exists
	}

	try {
		if (appendedEvents.length > 0) {
			appendedEvents += "\n"
		}
		localStorage.setItem(
			`${TRACKING_DATA_LOCAL_STORAGE_ELEMENT}/${fileChecksum}-events`,
			appendedEvents + JSON.stringify(eventTrackingItem)
		)
	} catch {
		// ignore tracking errors
	}
}

function buildEventTrackingItem(
	mapId: string,
	actionType: string,
	payload?: string & Record<string, string & MetricStatistics>
): EventTrackingItem | null {
	if (isSettingChangedEvent(actionType)) {
		return {
			mapId,
			eventType: "setting_changed",
			eventTime: Date.now(),
			payload: {
				eventName: actionType,
				newValue: payload
			}
		}
	}

	if (actionType === BlacklistActions.ADD_BLACKLIST_ITEM || actionType === BlacklistActions.REMOVE_BLACKLIST_ITEM) {
		return {
			mapId,
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
			mapId,
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
		actionType === BlacklistActions.SET_BLACKLIST
	)
}
