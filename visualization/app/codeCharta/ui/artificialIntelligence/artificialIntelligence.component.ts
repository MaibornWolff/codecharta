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
import { metricThresholds } from "./artificialIntelligence.metricThresholds"
import { defaultMapColors, setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"
import { BlacklistService, BlacklistSubscriber } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { isPathBlacklisted } from "../../util/codeMapHelper"
import {
	ExperimentalFeaturesEnabledService,
	ExperimentalFeaturesEnabledSubscriber
} from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.service"
import { metricDescriptions } from "../../util/metric/metricDescriptions"
import percentRound from "percent-round"
import { setColorRange } from "../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { setHeightMetric } from "../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { setColorMetric } from "../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { setAreaMetric } from "../../state/store/dynamicSettings/areaMetric/areaMetric.actions"

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
	isOutlier?: boolean
}

interface RiskProfile {
	lowRisk: number
	moderateRisk: number
	highRisk: number
	veryHighRisk: number
	totalRloc?: number
}

const HEIGHT_METRIC = "mcc"
const AREA_METRIC = "rloc"
const EXCLUDED_FILES = new Set(["html", "sass", "scss", "scss", ".text", "md", undefined])

export class ArtificialIntelligenceController
	implements FilesSelectionSubscriber, BlacklistSubscriber, ExperimentalFeaturesEnabledSubscriber
{
	private _viewModel: {
		analyzedProgrammingLanguage: string
		suspiciousMetricSuggestionLinks: MetricSuggestionParameters[]
		unsuspiciousMetrics: string[]
		riskProfile: RiskProfile
	} = {
		analyzedProgrammingLanguage: undefined,
		suspiciousMetricSuggestionLinks: [],
		unsuspiciousMetrics: [],
		riskProfile: {} as RiskProfile
	}

	private rlocRisk = {} as RiskProfile
	private fileState: FileState
	private blacklist: BlacklistItem[] = []
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

			this.storeService.dispatch(setAreaMetric("rloc"))
			this.storeService.dispatch(setHeightMetric(metric.metric))
			this.storeService.dispatch(setColorMetric(metric.metric))
			this.storeService.dispatch(setColorRange(colorRange))
			this.storeService.dispatch(setMapColors(mapColors))
		}
	}

	onBlacklistChanged(blacklist: BlacklistItem[]) {
		this.blacklist = blacklist
		this.fileState = getVisibleFileStates(this.storeService.getState().files)[0]

		if (this.fileState !== undefined) {
			this.debounceCalculation()
		}
	}

	onFilesSelectionChanged(files: FileState[]) {
		const fileState = getVisibleFileStates(files)[0]
		if (fileState === undefined) {
			return
		}

		this.fileState = fileState
		this.debounceCalculation()
	}

	private calculate() {
		const { experimentalFeaturesEnabled } = this.storeService.getState().appSettings
		if (!experimentalFeaturesEnabled) {
			return
		}

		this.setDefaultRiskProfile()

		const mainProgrammingLanguage = this.getMostFrequentLanguage(this.fileState.file.map)

		if (mainProgrammingLanguage !== undefined) {
			this._viewModel.analyzedProgrammingLanguage = mainProgrammingLanguage
			this.calculateRiskProfile(this.fileState, HEIGHT_METRIC)
			this.calculateSuspiciousMetrics(this.fileState, mainProgrammingLanguage)
		}
	}

	private setDefaultRiskProfile() {
		this._viewModel.analyzedProgrammingLanguage = undefined
		this._viewModel.riskProfile = { lowRisk: 0, moderateRisk: 0, highRisk: 0, veryHighRisk: 0 }
		this.rlocRisk = { ...this._viewModel.riskProfile, totalRloc: 0 }
	}

	private calculateRiskProfile(fileState: FileState, metricName: string) {
		for (const { data } of hierarchy(fileState.file.map)) {
			// TODO calculate risk profile only for focused or currently visible but not excluded files.
			if (this.isFileInvalid(data, metricName)) {
				const fileExtension = this.getFileExtension(data.name)
				const languageSpecificThresholds = this.getAssociatedMetricThresholds(fileExtension)
				const thresholds = languageSpecificThresholds[metricName]
				const nodeMetricValue = data.attributes[metricName]
				const nodeRlocValue = data.attributes[AREA_METRIC]

				// Idea: We could calculate risk profiles per directory in the future.
				this.calculateRlocRisk(nodeMetricValue, thresholds, nodeRlocValue)
			}
		}

		if (this.rlocRisk.totalRloc === 0) {
			return
		}

		this.setRiskProfile()
	}

	private setRiskProfile() {
		const [lowRisk, moderateRisk, highRisk, veryHighRisk] = percentRound([
			this.rlocRisk.lowRisk,
			this.rlocRisk.moderateRisk,
			this.rlocRisk.highRisk,
			this.rlocRisk.veryHighRisk
		])

		this._viewModel.riskProfile = { lowRisk, moderateRisk, highRisk, veryHighRisk }
	}

	private isFileInvalid(node: CodeMapNode, metricName: string) {
		return (
			node.type === NodeType.FILE &&
			!isPathBlacklisted(node.path, this.blacklist, BlacklistType.exclude) &&
			node.attributes[metricName] !== undefined &&
			node.attributes[AREA_METRIC] !== undefined &&
			!EXCLUDED_FILES.has(this.getFileExtension(node.name))
		)
	}

	private calculateRlocRisk(nodeMetricValue: number, thresholds, nodeRlocValue: number) {
		this.rlocRisk.totalRloc += nodeRlocValue
		if (nodeMetricValue <= thresholds.percentile70) {
			this.rlocRisk.lowRisk += nodeRlocValue
		} else if (nodeMetricValue <= thresholds.percentile80) {
			this.rlocRisk.moderateRisk += nodeRlocValue
		} else if (nodeMetricValue <= thresholds.percentile90) {
			this.rlocRisk.highRisk += nodeRlocValue
		} else {
			this.rlocRisk.veryHighRisk += nodeRlocValue
		}
	}

	private calculateSuspiciousMetrics(fileState: FileState, programmingLanguage: string) {
		const metricValues = this.getSortedMetricValues(fileState, programmingLanguage)
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
		if (a.isOutlier && !b.isOutlier) return -1
		if (!a.isOutlier && b.isOutlier) return 1
		return 0
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

	private getSortedMetricValues(fileState: FileState, programmingLanguage): MetricValues {
		const metricValues: MetricValues = {}

		for (const { data } of hierarchy(fileState.file.map)) {
			if (
				data.type !== NodeType.FILE ||
				isPathBlacklisted(data.path, this.blacklist, BlacklistType.exclude) ||
				this.getFileExtension(data.name) !== programmingLanguage
			) {
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

	private getFileExtension(fileName: string) {
		return fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".") + 1) : undefined
	}

	private getMostFrequentLanguage(map: CodeMapNode) {
		const numberOfFilesPerLanguage = new Map()

		for (const { data } of hierarchy(map)) {
			if (data.name.includes(".") && data.type === NodeType.FILE) {
				const fileExtension = data.name.slice(data.name.lastIndexOf(".") + 1)
				const filesPerLanguage = numberOfFilesPerLanguage.get(fileExtension) ?? 0
				numberOfFilesPerLanguage.set(fileExtension, filesPerLanguage + 1)
			}
		}

		if (numberOfFilesPerLanguage.size === 0) {
			return
		}

		let language = ""
		let max = -1
		for (const [key, filesPerLanguage] of numberOfFilesPerLanguage) {
			if (max < filesPerLanguage) {
				max = filesPerLanguage
				language = key
			}
		}
		return language
	}

	private getAssociatedMetricThresholds(programmingLanguage: string) {
		return programmingLanguage === "java" ? metricThresholds["java"] : metricThresholds["miscellaneous"]
	}
}

export const artificialIntelligenceComponent = {
	selector: "artificialIntelligenceComponent",
	template: require("./artificialIntelligence.component.html"),
	controller: ArtificialIntelligenceController
}
