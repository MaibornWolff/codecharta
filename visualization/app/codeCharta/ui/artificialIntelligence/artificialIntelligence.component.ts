import "./artificialIntelligence.component.scss"
import { FilesSelectionSubscriber, FilesService } from "../../state/store/files/files.service"
import { FileState } from "../../model/files/files"
import { IRootScopeService } from "angular"
import { buildCustomConfigFromState } from "../../util/customConfigBuilder"
import { CustomConfigHelper } from "../../util/customConfigHelper"
import { StoreService } from "../../state/store.service"
import { klona } from "klona"
import { CustomConfigMapSelectionMode } from "../../model/customConfig/customConfig.api.model"
import { pushSorted } from "../../util/nodeDecorator"
import { ColorRange, NodeType, State } from "../../codeCharta.model"
import { hierarchy } from "d3-hierarchy"
import { getVisibleFileStates } from "../../model/files/files.helper"
import { metricThresholds } from "./artificialIntelligence.metricThresholds"
import { defaultMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCameraService"

interface MetricValues {
	[metric: string]: number[]
}

interface MetricAssessmentResults {
	suspiciousMetrics: Map<string, ColorRange>
	unsuspiciousMetrics: string[]
	outliersThresholds: Map<string, number>
}

interface MetricSuggestionParameters {
	metric: string
	from: number
	to: number
	generalCustomConfigId: string
	outlierCustomConfigId?: string
}

export class ArtificialIntelligenceController implements FilesSelectionSubscriber {
	private _viewModel: {
		suspiciousMetricSuggestionLinks: MetricSuggestionParameters[]
		unsuspiciousMetrics: string[]
		riskProfile: {
			lowRisk: number
			moderateRisk: number
			highRisk: number
			veryHighRisk: number
		}
	} = {
		suspiciousMetricSuggestionLinks: [],
		unsuspiciousMetrics: [],
		riskProfile: {
			lowRisk: 0,
			moderateRisk: 0,
			highRisk: 0,
			veryHighRisk: 0
		}
	}

	private mainProgrammingLanguage: string

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private threeOrbitControlsService: ThreeOrbitControlsService,
		private threeCameraService: ThreeCameraService
	) {
		"ngInject"
		FilesService.subscribe(this.$rootScope, this)
	}

	applyCustomConfig(configId: string) {
		CustomConfigHelper.applyCustomConfig(configId, this.storeService, this.threeCameraService, this.threeOrbitControlsService)
	}

	onFilesSelectionChanged(files: FileState[]) {
		const fileState = getVisibleFileStates(files)[0]
		if (fileState === undefined) {
			return
		}

		this.mainProgrammingLanguage = this.getMostFrequentLanguage(fileState.file.map)

		this.clearRiskProfile()
		this.calculateRiskProfile(fileState, this.mainProgrammingLanguage, "mcc")
		this.createCustomConfigSuggestions(fileState, this.mainProgrammingLanguage)
	}

	private clearRiskProfile() {
		this._viewModel.riskProfile = undefined
	}

	private calculateRiskProfile(fileState: FileState, programmingLanguage, metricName) {
		let totalRloc = 0
		let numberOfRlocLowRisk = 0
		let numberOfRlocModerateRisk = 0
		let numberOfRlocHighRisk = 0
		let numberOfRlocVeryHighRisk = 0

		const languageSpecificThresholds = this.getAssociatedMetricThresholds(programmingLanguage)

		for (const { data } of hierarchy(fileState.file.map)) {
			// TODO calculate risk profile only for focused, not excluded files.
			if (data.type !== NodeType.FILE || data.isExcluded) {
				continue
			}

			if (data.attributes[metricName] === undefined || data.attributes["rloc"] === undefined) {
				continue
			}

			const nodeMetricValue = data.attributes[metricName]
			const nodeRlocValue = data.attributes["rloc"]

			const metricThresholds = languageSpecificThresholds[metricName]
			totalRloc += nodeRlocValue

			// Idea: We could calculate risk profiles per directory in the future.
			if (nodeMetricValue <= metricThresholds.percentile70) {
				numberOfRlocLowRisk += nodeRlocValue
			} else if (nodeMetricValue <= metricThresholds.percentile80) {
				numberOfRlocModerateRisk += nodeRlocValue
			} else if (nodeMetricValue <= metricThresholds.percentile90) {
				numberOfRlocHighRisk += nodeRlocValue
			} else {
				numberOfRlocVeryHighRisk += nodeRlocValue
			}
		}

		if (totalRloc === 0) {
			return
		}

		this._viewModel.riskProfile = {
			lowRisk: Math.ceil((numberOfRlocLowRisk / totalRloc) * 100),
			moderateRisk: Math.ceil((numberOfRlocModerateRisk / totalRloc) * 100),
			highRisk: Math.ceil((numberOfRlocHighRisk / totalRloc) * 100),
			veryHighRisk: Math.ceil((numberOfRlocVeryHighRisk / totalRloc) * 100)
		}
	}

	private createCustomConfigSuggestions(fileState: FileState, programmingLanguage) {
		const metricValues = this.getSortedMetricValues(fileState, programmingLanguage)
		const metricAssessmentResults = this.findGoodAndBadMetrics(metricValues, programmingLanguage)

		const noticeableMetricSuggestionLinks = new Map<string, MetricSuggestionParameters>()

		for (const [metricName, colorRange] of metricAssessmentResults.suspiciousMetrics) {
			const overviewConfigState = this.prepareOverviewConfigState(metricName, colorRange.from, colorRange.to)
			const overviewConfigName = `Suspicious Files - Metric ${metricName.toUpperCase()} - (AI)`
			const overviewConfig = this.createAndAddCustomConfig(overviewConfigName, overviewConfigState, fileState)

			noticeableMetricSuggestionLinks.set(metricName, {
				metric: metricName,
				...colorRange,
				generalCustomConfigId: overviewConfig.id
			})

			const outlierThreshold = metricAssessmentResults.outliersThresholds.get(metricName)
			if (outlierThreshold > 0) {
				const outlierToValue = outlierThreshold
				const outlierFromValue = outlierToValue - 1

				const outlierConfigState = this.prepareOutlierConfigState(metricName, outlierFromValue, outlierToValue)
				const outlierConfigName = `Very High Risk Files - Metric ${metricName.toUpperCase()} - (AI)`
				const outlierConfig = this.createAndAddCustomConfig(outlierConfigName, outlierConfigState, fileState)

				noticeableMetricSuggestionLinks.get(metricName).outlierCustomConfigId = outlierConfig.id
			}
		}

		CustomConfigHelper.setCustomConfigsToLocalStorage()

		this._viewModel.suspiciousMetricSuggestionLinks = [...noticeableMetricSuggestionLinks.values()]
		this._viewModel.unsuspiciousMetrics = metricAssessmentResults.unsuspiciousMetrics
	}

	private findGoodAndBadMetrics(metricValues, programmingLanguage): MetricAssessmentResults {
		const metricAssessmentResults: MetricAssessmentResults = {
			suspiciousMetrics: new Map<string, ColorRange>(),
			unsuspiciousMetrics: [],
			outliersThresholds: new Map<string, number>()
		}

		const languageSpecificMetricThresholds = this.getAssociatedMetricThresholds(programmingLanguage)

		for (const metricName of Object.keys(languageSpecificMetricThresholds)) {
			const valuesOfMetric = metricValues[metricName]
			if (valuesOfMetric === undefined) {
				continue
			}

			const thresholdConfig = languageSpecificMetricThresholds[metricName]
			const maxMetricValue = Math.max(...valuesOfMetric)

			if (maxMetricValue <= thresholdConfig.percentile70) {
				metricAssessmentResults.unsuspiciousMetrics.push(metricName)
			} else if (maxMetricValue > thresholdConfig.percentile70) {
				metricAssessmentResults.suspiciousMetrics.set(metricName, {
					from: thresholdConfig.percentile70,
					to: thresholdConfig.percentile80
				})

				if (maxMetricValue > thresholdConfig.percentile90) {
					metricAssessmentResults.outliersThresholds.set(metricName, thresholdConfig.percentile90)
				}
			}
		}

		return metricAssessmentResults
	}

	private createAndAddCustomConfig(configName: string, state: State, fileState: FileState) {
		let customConfig = CustomConfigHelper.getCustomConfigByName(
			CustomConfigMapSelectionMode.SINGLE,
			[fileState.file.fileMeta.fileName],
			configName
		)

		// If it exists, create a fresh one with current thresholds
		if (customConfig !== null) {
			CustomConfigHelper.deleteCustomConfig(customConfig.id)
		}

		customConfig = buildCustomConfigFromState(configName, state)
		CustomConfigHelper.addCustomConfig(customConfig)

		return customConfig
	}

	private prepareOverviewConfigState(metricName: string, colorRangeFrom: number, colorRangeTo: number) {
		const state = klona(this.storeService.getState())

		// just use rloc as area metric
		state.dynamicSettings.areaMetric = "rloc"

		// use bad metric as height and color metric
		state.dynamicSettings.heightMetric = metricName
		state.dynamicSettings.colorMetric = metricName
		//state.dynamicSettings.colorRange.from = bugOutlier.valueOf() / 2
		//state.dynamicSettings.colorRange.to = bugOutlier.valueOf()
		state.dynamicSettings.colorRange.from = colorRangeFrom
		state.dynamicSettings.colorRange.to = colorRangeTo

		state.appSettings.mapColors.positive = defaultMapColors.positive
		state.appSettings.mapColors.neutral = defaultMapColors.neutral
		state.appSettings.mapColors.negative = defaultMapColors.negative

		return state
	}

	private prepareOutlierConfigState(metricName: string, colorRangeFrom: number, colorRangeTo: number) {
		const state = klona(this.storeService.getState())

		// just use rloc as area metric
		state.dynamicSettings.areaMetric = "rloc"

		// use bad metric as height and color metric
		state.dynamicSettings.heightMetric = metricName
		state.dynamicSettings.colorMetric = metricName

		state.dynamicSettings.colorRange.to = colorRangeTo
		state.dynamicSettings.colorRange.from = colorRangeFrom

		state.appSettings.mapColors.positive = "#ffffff"
		state.appSettings.mapColors.neutral = "#ffffff"
		state.appSettings.mapColors.negative = "#A900C0"

		return state
	}

	private getSortedMetricValues(fileState: FileState, programmingLanguage): MetricValues {
		const metricValues: MetricValues = {}

		for (const { data } of hierarchy(fileState.file.map)) {
			if (data.type !== NodeType.FILE || data.isExcluded) {
				continue
			}

			if (!data.name.includes(".")) {
				continue
			}

			const fileExtension = data.name.slice(data.name.lastIndexOf(".") + 1)
			if (fileExtension !== programmingLanguage) {
				continue
			}

			for (const metricIndex of Object.keys(data.attributes)) {
				const value = data.attributes[metricIndex]
				if (value > 0) {
					if (metricValues[metricIndex] === undefined) {
						metricValues[metricIndex] = []
					}
					pushSorted(metricValues[metricIndex], data.attributes[metricIndex])
				}
			}
		}

		return metricValues
	}

	private getMostFrequentLanguage(map) {
		const numberOfFilesPerLanguage = []

		for (const { data } of hierarchy(map)) {
			if (!data.name.includes(".")) {
				continue
			}

			if (data.type === NodeType.FILE) {
				const fileExtension = data.name.slice(data.name.lastIndexOf(".") + 1)
				numberOfFilesPerLanguage[fileExtension] = numberOfFilesPerLanguage[fileExtension] + 1 || 1
			}
		}

		return Object.keys(numberOfFilesPerLanguage).reduce((a, b) => {
			return numberOfFilesPerLanguage[a] > numberOfFilesPerLanguage[b] ? a : b
		})
	}

	private getAssociatedMetricThresholds(programmingLanguage) {
		return programmingLanguage === "java" ? metricThresholds["java"] : metricThresholds["miscellaneous"]
	}
}

export const artificialIntelligenceComponent = {
	selector: "artificialIntelligenceComponent",
	template: require("./artificialIntelligence.component.html"),
	controller: ArtificialIntelligenceController
}
