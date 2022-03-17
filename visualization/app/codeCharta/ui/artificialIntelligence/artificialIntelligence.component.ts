import "./artificialIntelligence.component.scss"
import debounce from "lodash.debounce"
import { FilesSelectionSubscriber, FilesService } from "../../state/store/files/files.service"
import { FileState } from "../../model/files/files"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { pushSorted } from "../../util/nodeDecorator"
import { BlacklistItem, BlacklistType, CodeMapNode, ColorRange, NodeType } from "../../codeCharta.model"
import { hierarchy } from "d3-hierarchy"
import { getVisibleFileStates } from "../../model/files/files.helper"
import { defaultMapColors, setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"
import { BlacklistService, BlacklistSubscriber } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { isPathBlacklisted } from "../../util/codeMapHelper"
import {
	ExperimentalFeaturesEnabledService,
	ExperimentalFeaturesEnabledSubscriber
} from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.service"
import { metricDescriptions } from "../../util/metric/metricDescriptions"
import { setColorRange } from "../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { setHeightMetric } from "../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { setColorMetric } from "../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { setAreaMetric } from "../../state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { accumulatedDataSelector } from "../../state/selectors/accumulatedData/accumulatedData.selector"
import {
	AREA_METRIC,
	calculateRiskProfile,
	getAssociatedMetricThresholds,
	isFileValid,
	RiskProfile,
	setRiskProfile
} from "./riskProfilHelper"

interface MetricValues {
	[metric: string]: number[]
}

interface MetricValuesByLanguage {
	[language: string]: MetricValues
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
	isOutlier?: boolean
}

interface ArtificialIntelligenceControllerViewModel {
	analyzedProgrammingLanguage: string
	suspiciousMetricSuggestionLinks: MetricSuggestionParameters[]
	unsuspiciousMetrics: string[]
	riskProfile: RiskProfile
}

export class ArtificialIntelligenceController
	implements FilesSelectionSubscriber, BlacklistSubscriber, ExperimentalFeaturesEnabledSubscriber
{
	private defaultViewModel: ArtificialIntelligenceControllerViewModel = {
		analyzedProgrammingLanguage: undefined,
		suspiciousMetricSuggestionLinks: [],
		unsuspiciousMetrics: [],
		riskProfile: { lowRisk: 0, moderateRisk: 0, highRisk: 0, veryHighRisk: 0 }
	}

	private _viewModel: ArtificialIntelligenceControllerViewModel = { ...this.defaultViewModel }
	private fileState: FileState[]
	private blacklist: BlacklistItem[] = []
	private aggregatedMap: CodeMapNode
	private debounceCalculation: () => void

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		FilesService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
		ExperimentalFeaturesEnabledService.subscribe(this.$rootScope, this)

		this.debounceCalculation = debounce(() => {
			this.calculate()
		}, 10)
	}

	onExperimentalFeaturesEnabledChanged(experimentalFeaturesEnabled: boolean) {
		if (experimentalFeaturesEnabled) {
			this.debounceCalculation()
		}
	}

	applySuspiciousMetric(metric: MetricSuggestionParameters, isOutlier: boolean) {
		if (this._viewModel.suspiciousMetricSuggestionLinks.includes(metric)) {
			const mapColors = { ...this.storeService.getState().appSettings.mapColors }
			const colorRange: ColorRange = {
				from: metric.from,
				to: metric.to,
				max: 0,
				min: 0
			}

			if (metric.isOutlier === isOutlier) {
				mapColors.positive = "#ffffff"
				mapColors.neutral = "#ffffff"
				mapColors.negative = "#A900C0"
			} else {
				mapColors.positive = defaultMapColors.positive
				mapColors.neutral = defaultMapColors.neutral
				mapColors.negative = defaultMapColors.negative
			}

			this.storeService.dispatch(setAreaMetric(AREA_METRIC))
			this.storeService.dispatch(setHeightMetric(metric.metric))
			this.storeService.dispatch(setColorMetric(metric.metric))
			this.storeService.dispatch(setColorRange(colorRange))
			this.storeService.dispatch(setMapColors(mapColors))
		}
	}

	onBlacklistChanged(blacklist: BlacklistItem[]) {
		this.blacklist = blacklist
		this.fileState = getVisibleFileStates(this.storeService.getState().files)
		if (this.fileState !== undefined) {
			this.debounceCalculation()
		}
	}

	onFilesSelectionChanged() {
		this.aggregatedMap = accumulatedDataSelector(this.storeService.getState()).unifiedMapNode
		if (this.aggregatedMap !== undefined) {
			this.debounceCalculation()
		}
	}

	private calculate() {
		const { experimentalFeaturesEnabled } = this.storeService.getState().appSettings
		if (!experimentalFeaturesEnabled) {
			return
		}

		this._viewModel = { ...this.defaultViewModel }

		const languageByNumberOfFiles = new Map<string, number>()
		const rlocRisk: RiskProfile = { lowRisk: 0, moderateRisk: 0, highRisk: 0, veryHighRisk: 0 }
		let totalRloc = 0

		const metricValues: MetricValues = {}
		const metricValuesByLanguage: MetricValuesByLanguage[] = []

		for (const { data } of hierarchy(this.aggregatedMap)) {
			const fileExtension = this.getFileExtension(data.name)
			if (data.type === NodeType.FILE && fileExtension !== undefined) {
				this.detectProgrammingLanguageByOccurrence(languageByNumberOfFiles, fileExtension)
				this.getSortedMetricValues(data, metricValues)
				metricValuesByLanguage[fileExtension] = metricValues

				// TODO calculate risk profile only for focused or currently visible but not excluded files.
				if (isFileValid(data, fileExtension, this.blacklist)) {
					totalRloc = calculateRiskProfile(data, totalRloc, rlocRisk, fileExtension)
				}
			}

			if (totalRloc > 0) {
				this._viewModel.riskProfile = setRiskProfile(rlocRisk)
			}
		}

		const mainProgrammingLanguage = this.getMostFrequentLanguage(languageByNumberOfFiles)
		this._viewModel.analyzedProgrammingLanguage = mainProgrammingLanguage.length > 0 ? mainProgrammingLanguage : undefined

		if (mainProgrammingLanguage !== undefined) {
			this.calculateSuspiciousMetrics(metricValuesByLanguage, mainProgrammingLanguage)
		}
	}

	private detectProgrammingLanguageByOccurrence(numberOfFilesPerLanguage: Map<string, number>, fileExtension: string) {
		const filesPerLanguage = numberOfFilesPerLanguage.get(fileExtension) ?? 0
		numberOfFilesPerLanguage.set(fileExtension, filesPerLanguage + 1)
	}

	private getMostFrequentLanguage(numberOfFilesPerLanguage: Map<string, number>) {
		let language = ""
		if (numberOfFilesPerLanguage.size > 0) {
			let max = -1
			for (const [key, filesPerLanguage] of numberOfFilesPerLanguage) {
				if (max < filesPerLanguage) {
					max = filesPerLanguage
					language = key
				}
			}
		}
		return language
	}

	private calculateSuspiciousMetrics(metricValues: MetricValuesByLanguage[], programmingLanguage: string) {
		const metricAssessmentResults = this.findGoodAndBadMetrics(metricValues, programmingLanguage)
		const noticeableMetricSuggestionLinks = new Map<string, MetricSuggestionParameters>()

		for (const [metricName, colorRange] of metricAssessmentResults.suspiciousMetrics) {
			noticeableMetricSuggestionLinks.set(metricName, {
				metric: metricName,
				...colorRange
			})

			const outlierThreshold = metricAssessmentResults.outliersThresholds.get(metricName)
			if (outlierThreshold > 0) {
				noticeableMetricSuggestionLinks.get(metricName).isOutlier = true
			}
		}

		this._viewModel.suspiciousMetricSuggestionLinks = [...noticeableMetricSuggestionLinks.values()].sort(
			this.compareSuspiciousMetricSuggestionLinks
		)
		this._viewModel.unsuspiciousMetrics = metricAssessmentResults.unsuspiciousMetrics
	}

	private compareSuspiciousMetricSuggestionLinks(a: MetricSuggestionParameters, b: MetricSuggestionParameters): number {
		if (a.isOutlier && !b.isOutlier) {
			return -1
		}
		if (!a.isOutlier && b.isOutlier) {
			return 1
		}
		return 0
	}

	private findGoodAndBadMetrics(metricValues: MetricValuesByLanguage[], mainProgrammingLanguage: string): MetricAssessmentResults {
		const metricAssessmentResults: MetricAssessmentResults = {
			suspiciousMetrics: new Map<string, ColorRange>(),
			unsuspiciousMetrics: [],
			outliersThresholds: new Map<string, number>()
		}

		const languageSpecificMetricThresholds = getAssociatedMetricThresholds(mainProgrammingLanguage)

		for (const metricName of Object.keys(languageSpecificMetricThresholds)) {
			const valuesOfMetric = metricValues[mainProgrammingLanguage][metricName]

			if (valuesOfMetric === undefined) {
				continue
			}

			const thresholdConfig = languageSpecificMetricThresholds[metricName]
			const maxMetricValue = Math.max(...valuesOfMetric)

			if (maxMetricValue <= thresholdConfig.percentile70) {
				metricAssessmentResults.unsuspiciousMetrics.push(`${metricName} (${metricDescriptions.get(metricName)})`)
			} else if (maxMetricValue > thresholdConfig.percentile70) {
				metricAssessmentResults.suspiciousMetrics.set(metricName, {
					from: thresholdConfig.percentile70,
					to: thresholdConfig.percentile80,
					max: 0,
					min: 0
				})

				if (maxMetricValue > thresholdConfig.percentile90) {
					metricAssessmentResults.outliersThresholds.set(metricName, thresholdConfig.percentile90)
				}
			}
		}

		return metricAssessmentResults
	}

	private getSortedMetricValues(node: CodeMapNode, metricValues: MetricValues) {
		if (!isPathBlacklisted(node.path, this.blacklist, BlacklistType.exclude)) {
			for (const metricIndex of Object.keys(node.attributes)) {
				const value = node.attributes[metricIndex]
				if (value > 0) {
					if (metricValues[metricIndex] === undefined) {
						metricValues[metricIndex] = []
					}
					pushSorted(metricValues[metricIndex], node.attributes[metricIndex])
				}
			}
		}
	}

	private getFileExtension(fileName: string) {
		return fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".") + 1) : undefined
	}
}

export const artificialIntelligenceComponent = {
	selector: "artificialIntelligenceComponent",
	template: require("./artificialIntelligence.component.html"),
	controller: ArtificialIntelligenceController
}
