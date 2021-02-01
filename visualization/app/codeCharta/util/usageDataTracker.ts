"use strict"

import { getVisibleFileStates, isSingleState } from "../model/files/files.helper"
import { FileExtensionCalculator, MetricDistribution } from "./fileExtensionCalculator"
import { CodeChartaStorage } from "./codeChartaStorage"
import { MetricKeyValue, MetricsPerLanguage, State } from "../codeCharta.model"
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
import { getMedian } from "./nodeDecorator"

interface TrackingDataItem {
	mapId: string
	codeChartaApiVersion: string
	creationTime: number
	exportedFileSizeInBytes: number
	totalLinesOfCode: number
	totalRealLinesOfCode: number
	programmingLanguages: string[]
	totalNumberOfFiles: number
	numberOfFilesPerLanguage: Map<string, number>
	maxFilePathDepth: number
	avgFilePathDepth: number
	languageDistribution: LanguageDistributionStatistics
	metricStatisticsPerLanguage: MetricStatisticsPerLanguage
	metricStatisticsOverall: MetricStatisticsOverall
}

interface LanguageDistributionStatistics {
	[languageName: string]: {
		metricName: string
		absoluteValue: number
		relativeValue: number
	}
}

interface MetricStatisticsPerLanguage {
	[languageName: string]: {
		[metricName: string]: TrackingDataMetricItem
	}
}

interface MetricStatisticsOverall {
	[metricName: string]: TrackingDataMetricOutlierItem
}

interface TrackingDataMetricItem {
	metricName: string
	min: number
	max: number
	totalSum: number
	numberOfFiles: number
	median: number
	avg: number
}

interface TrackingDataMetricOutlierItem extends TrackingDataMetricItem {
	boxplot_irq_outliers: string[]
}

function isTrackingAllowed(state: State) {
	return isStandalone() && isSingleState(state.files) && getVisibleFileStates(state.files).length === 1
}

export function trackMetaUsageData(state: State) {
	if (!isTrackingAllowed(state)) {
		return
	}

	const singleFileStates = getVisibleFileStates(state.files)

	const fileMeta = singleFileStates[0].file.fileMeta
	const fileMetaStatistics = fileMeta.statistics

	// TODO: handle and check for absence of rloc and presence of loc
	const languageDistribution = FileExtensionCalculator.getMetricDistribution(singleFileStates[0].file.map, "rloc")

	const trackingDataItem: TrackingDataItem = {
		mapId: fileMeta.fileChecksum,
		codeChartaApiVersion: fileMeta.apiVersion,
		creationTime: Date.now(),
		exportedFileSizeInBytes: fileMeta.exportedFileSize,
		languageDistribution: mapLanguageDistribution(languageDistribution),
		totalRealLinesOfCode: fileMetaStatistics.totalRealLinesOfCode,
		totalLinesOfCode: fileMetaStatistics.totalLinesOfCode,
		programmingLanguages: fileMetaStatistics.programmingLanguages,
		numberOfFilesPerLanguage: fileMetaStatistics.numberOfFilesPerLanguage,
		totalNumberOfFiles: fileMetaStatistics.totalNumberOfFiles,
		maxFilePathDepth: fileMetaStatistics.maxFilePathDepth,
		avgFilePathDepth: fileMetaStatistics.avgFilePathDepth,
		metricStatisticsPerLanguage: mapMetricStatisticsPerLanguage(fileMetaStatistics.metricStatisticsPerLanguage),
		metricStatisticsOverall: mapMetricStatisticsOverall(fileMetaStatistics.metricStatisticsOverall)
	}

	const fileStorage = new CodeChartaStorage()

	try {
		fileStorage.setItem(`usageData/${trackingDataItem.mapId}-meta`, JSON.stringify(trackingDataItem))
	} catch {
		// ignore it
	}
}

function mapLanguageDistribution(languageDistribution: MetricDistribution[]) {
	const mappedDistribution: LanguageDistributionStatistics = {}

	for (const distributionItem of languageDistribution) {
		mappedDistribution[distributionItem.fileExtension] = {
			metricName: "rloc",
			absoluteValue: distributionItem.absoluteMetricValue,
			relativeValue: distributionItem.relativeMetricValue
		}
	}

	return mappedDistribution
}

function mapMetricStatisticsPerLanguage(metricStatisticsPerLanguage: MetricsPerLanguage) {
	//TODO: reuse mapMetricStatisticsOverall()
	const mappedStatistics = {}

	for (const languageIndex of Object.keys(metricStatisticsPerLanguage)) {
		const languageMetrics = {}
		mappedStatistics[languageIndex] = languageMetrics

		for (const metricIndex of Object.keys(metricStatisticsPerLanguage[languageIndex])) {
			const metricStatistics = metricStatisticsPerLanguage[languageIndex][metricIndex]

			// Filter 0-values to calculate median properly
			let metricValues = metricStatistics.values
			metricValues = metricValues.filter(function (metricValue) {
				return metricValue > 0
			})

			languageMetrics[metricIndex] = {
				metricName: metricIndex,
				min: metricStatistics.min,
				max: metricStatistics.max,
				totalSum: metricStatistics.totalSum,
				numberOfFiles: metricStatistics.numberOfFiles,
				median: getMedian(metricValues).toPrecision(2),
				avg: metricStatistics.average.toPrecision(2)
			}
		}
	}

	return mappedStatistics
}

function mapMetricStatisticsOverall(metricStatisticsOverall: MetricKeyValue) {
	const mappedStatistics = {}

	for (const metricIndex of Object.keys(metricStatisticsOverall)) {
		const metricStatistics = metricStatisticsOverall[metricIndex]

		// Filter 0-values to calculate median properly
		let metricValues = metricStatistics.values
		metricValues = metricValues.filter(function (metricValue) {
			return metricValue > 0
		})

		mappedStatistics[metricIndex] = {
			metricName: metricIndex,
			boxplot_irq_outliers: [],
			min: metricStatistics.min,
			max: metricStatistics.max,
			totalSum: metricStatistics.totalSum,
			numberOfFiles: metricStatistics.numberOfFiles,
			median: getMedian(metricValues).toPrecision(2),
			avg: metricStatistics.average.toPrecision(2)
		}
	}
	return mappedStatistics
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
	if (!isTrackingAllowed(state)) {
		return
	}

	//TODO: Refactor
	if (
		!isActionOfType(actionType, AreaMetricActions) &&
		!isActionOfType(actionType, HeightMetricActions) &&
		!isActionOfType(actionType, ColorMetricActions) &&
		!isActionOfType(actionType, ColorRangeActions) &&
		!isActionOfType(actionType, InvertColorRangeActions) &&
		!isActionOfType(actionType, BlacklistActions) &&
		!isActionOfType(actionType, FocusedNodePathActions)
	) {
		return
	}

	let eventTrackingItem: EventTrackingItem

	if (
		isActionOfType(actionType, AreaMetricActions) ||
		isActionOfType(actionType, HeightMetricActions) ||
		isActionOfType(actionType, ColorMetricActions) ||
		isActionOfType(actionType, ColorRangeActions) ||
		isActionOfType(actionType, InvertColorRangeActions)
	) {
		eventTrackingItem = {
			eventType: "setting_changed",
			eventTime: Date.now(),
			payload: {
				eventName: actionType,
				newValue: payload
			}
		}
	}

	if (isActionOfType(actionType, BlacklistActions)) {
		eventTrackingItem = {
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
		eventTrackingItem = {
			eventType: "node_interaction",
			eventTime: Date.now(),
			payload: {
				eventName: actionType,
				id: md5(payload)
			}
		}
	}

	const { fileChecksum } = getVisibleFileStates(state.files)[0].file.fileMeta
	const fileStorage = new CodeChartaStorage()

	try {
		const appendedEvents = `${fileStorage.getItem(`usageData/${fileChecksum}-events`)}\n${JSON.stringify(eventTrackingItem)}`
		fileStorage.setItem(`usageData/${fileChecksum}-events`, appendedEvents)
	} catch {
		// ignore tracking errors
	}
}
