import "./artificialIntelligence.component.scss"
import debounce from "lodash.debounce"
import { FilesSelectionSubscriber, FilesService } from "../../state/store/files/files.service"
import { FileState } from "../../model/files/files"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { pushSorted } from "../../util/nodeDecorator"
import { BlacklistItem, BlacklistType, CodeMapNode, ColorRange, NodeType, stateObjectReplacer } from "../../codeCharta.model"
import { hierarchy } from "d3-hierarchy"
import { getVisibleFileStates } from "../../model/files/files.helper"
import { metricThresholds } from "./artificialIntelligence.metricThresholds"
import { BlacklistService, BlacklistSubscriber } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { isPathBlacklisted } from "../../util/codeMapHelper"
import {
	ExperimentalFeaturesEnabledService,
	ExperimentalFeaturesEnabledSubscriber
} from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.service"
import { metricDescriptions } from "../../util/metric/metricDescriptions"
import percentRound from "percent-round"
import { SuspiciousMetricConfigHelper } from "./suspiciousMetricConfigHelper"
import {
	MetricAssessmentResults,
	MetricSuggestionParameters,
	MetricValues,
	SuspiciousMetricConfig
} from "./suspiciousMetricConfig.api.model"
import md5 from "md5"
import { klona } from "klona"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCameraService"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { defaultAppSettings } from "../../state/store/appSettings/appSettings.actions"

export class ArtificialIntelligenceController
	implements FilesSelectionSubscriber, BlacklistSubscriber, ExperimentalFeaturesEnabledSubscriber
{
	private _viewModel: {
		analyzedProgrammingLanguage: string
		suspiciousMetricSuggestionLinks: MetricSuggestionParameters[]
		unsuspiciousMetrics: string[]
		riskProfile: {
			lowRisk: number
			moderateRisk: number
			highRisk: number
			veryHighRisk: number
		}
		isHighRiskFilesModeEnabled: boolean
	} = {
		analyzedProgrammingLanguage: undefined,
		suspiciousMetricSuggestionLinks: [],
		unsuspiciousMetrics: [],
		riskProfile: {
			lowRisk: 0,
			moderateRisk: 0,
			highRisk: 0,
			veryHighRisk: 0
		},
		isHighRiskFilesModeEnabled: false
	}

	private debounceCalculation: () => void
	private fileState: FileState
	private blacklist: BlacklistItem[] = []

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private threeOrbitControlsService: ThreeOrbitControlsService,
		private threeCameraService: ThreeCameraService
	) {
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

	applySuspiciousMetricConfig(configId: string) {
		SuspiciousMetricConfigHelper.applySuspiciousMetricConfig(
			configId,
			this.storeService,
			this.threeCameraService,
			this.threeOrbitControlsService
		)
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

		const mainProgrammingLanguage = this.getMostFrequentLanguage(this.fileState.file.map)
		this._viewModel.analyzedProgrammingLanguage = mainProgrammingLanguage

		this.clearRiskProfile()

		if (mainProgrammingLanguage !== undefined) {
			this.calculateRiskProfile(this.fileState, mainProgrammingLanguage, "mcc")
			this.createSuspiciousMetricConfigSuggestions(this.fileState, mainProgrammingLanguage)
		}
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
		const thresholds = languageSpecificThresholds[metricName]

		for (const { data } of hierarchy(fileState.file.map)) {
			// TODO calculate risk profile only for focused or currently visible but not excluded files.
			if (
				data.type !== NodeType.FILE ||
				isPathBlacklisted(data.path, this.blacklist, BlacklistType.exclude) ||
				data.attributes[metricName] === undefined ||
				data.attributes["rloc"] === undefined ||
				this.getFileExtension(data.name) !== programmingLanguage
			) {
				continue
			}

			const nodeMetricValue = data.attributes[metricName]
			const nodeRlocValue = data.attributes["rloc"]

			totalRloc += nodeRlocValue

			// Idea: We could calculate risk profiles per directory in the future.
			if (nodeMetricValue <= thresholds.percentile70) {
				numberOfRlocLowRisk += nodeRlocValue
			} else if (nodeMetricValue <= thresholds.percentile80) {
				numberOfRlocModerateRisk += nodeRlocValue
			} else if (nodeMetricValue <= thresholds.percentile90) {
				numberOfRlocHighRisk += nodeRlocValue
			} else {
				numberOfRlocVeryHighRisk += nodeRlocValue
			}
		}

		if (totalRloc === 0) {
			return
		}

		const [lowRisk, moderateRisk, highRisk, veryHighRisk] = percentRound([
			numberOfRlocLowRisk,
			numberOfRlocModerateRisk,
			numberOfRlocHighRisk,
			numberOfRlocVeryHighRisk
		])

		this._viewModel.riskProfile = {
			lowRisk,
			moderateRisk,
			highRisk,
			veryHighRisk
		}
	}

	private createSuspiciousMetricConfigSuggestions(fileState: FileState, programmingLanguage) {
		const metricValues = this.getSortedMetricValues(fileState, programmingLanguage)
		const metricAssessmentResults = this.findGoodAndBadMetrics(metricValues, programmingLanguage)

		const noticeableMetricSuggestionLinks = new Map<string, MetricSuggestionParameters>()
		const newSuspiciousMetricConfigs: SuspiciousMetricConfig[] = []
		for (const [metricName, colorRange] of metricAssessmentResults.suspiciousMetrics) {
			const outlierThreshold = metricAssessmentResults.outliersThresholds.get(metricName)

			const suspiciousMetricConfig = this.prepareSusbiciosMetricConfig(
				metricName,
				fileState,
				this.suspiciousMetricConfigMapColor(metricName, colorRange)
			)

			newSuspiciousMetricConfigs.push(suspiciousMetricConfig)
			noticeableMetricSuggestionLinks.set(metricName, {
				metric: metricName,
				...colorRange,
				generalSuspiciousMetricConfigId: suspiciousMetricConfig.id
			})
			if (outlierThreshold > 0) {
				const highRiskMetricConfig = this.prepareSusbiciosMetricConfig(
					metricName,
					fileState,
					this.highRiskSuspiciousMetricConfigMapColor(metricName, outlierThreshold)
				)

				newSuspiciousMetricConfigs.push(highRiskMetricConfig)

				noticeableMetricSuggestionLinks.get(metricName).outlierSuspiciousMetricConfigId = highRiskMetricConfig.id
			}
		}
		SuspiciousMetricConfigHelper.addSuspiciousMetricConfigs(newSuspiciousMetricConfigs)
		this._viewModel.suspiciousMetricSuggestionLinks = [...noticeableMetricSuggestionLinks.values()].sort(
			this.compareSuspiciousMetricSuggestionLinks
		)
		this._viewModel.unsuspiciousMetrics = metricAssessmentResults.unsuspiciousMetrics
	}

	// @ts-ignore
	private prepareSusbiciosMetricConfig(metricName, fileState: FileState, stateSetting) {
		const suspiciousMetricConfig = SuspiciousMetricConfigHelper.getSuspiciousMetricConfigByName(
			fileState.selectedAs,
			fileState.file.fileMeta.fileChecksum,
			metricName
		)

		// If it exists, create a fresh one with current thresholds
		if (suspiciousMetricConfig !== null) {
			SuspiciousMetricConfigHelper.deleteSuspiciousMetricConfig(suspiciousMetricConfig.id)
		}
		const suspicoiusMetricConfig = {
			id: "",
			fileChecksum: fileState.file.fileMeta.fileChecksum,
			mapSelectionMode: fileState.selectedAs,
			date: Date.now(),
			analyzedProgrammingLanguage: undefined,
			suspiciousMetricSuggestionLinks: [],
			unsuspiciousMetrics: [],
			riskProfile: {
				lowRisk: 0,
				moderateRisk: 0,
				highRisk: 0,
				veryHighRisk: 0
			},
			stateSettings: stateSetting,
			isHighRiskFilesModeEnabled: false
		}
		suspicoiusMetricConfig.id = md5(JSON.stringify(suspicoiusMetricConfig, stateObjectReplacer))
		return suspicoiusMetricConfig
	}

	private highRiskSuspiciousMetricConfigMapColor(metricName, outlierThreshold) {
		const state = klona(this.storeService.getState())

		// just use rloc as area metric
		state.dynamicSettings.areaMetric = "rloc"

		// use bad metric as height and color metric
		state.dynamicSettings.heightMetric = metricName
		state.dynamicSettings.colorMetric = metricName

		state.dynamicSettings.colorRange.to = outlierThreshold - 1
		state.dynamicSettings.colorRange.from = outlierThreshold

		state.appSettings.mapColors.positive = "#ffffff"
		state.appSettings.mapColors.neutral = "#ffffff"
		state.appSettings.mapColors.negative = "#A900C0"

		return state
	}

	private suspiciousMetricConfigMapColor(metricName, colorRange) {
		const state = klona(this.storeService.getState())

		// just use rloc as area metric
		state.dynamicSettings.areaMetric = "rloc"

		// use bad metric as height and color metric
		state.dynamicSettings.heightMetric = metricName
		state.dynamicSettings.colorMetric = metricName

		state.dynamicSettings.colorRange.to = colorRange.to
		state.dynamicSettings.colorRange.from = colorRange.from

		state.appSettings.mapColors.positive = defaultAppSettings.mapColors.positive
		state.appSettings.mapColors.neutral = defaultAppSettings.mapColors.neutral
		state.appSettings.mapColors.negative = defaultAppSettings.mapColors.negative

		return state
	}

	private compareSuspiciousMetricSuggestionLinks(a: MetricSuggestionParameters, b: MetricSuggestionParameters): number {
		if (a.outlierSuspiciousMetricConfigId && !b.outlierSuspiciousMetricConfigId) return -1
		if (!a.outlierSuspiciousMetricConfigId && b.outlierSuspiciousMetricConfigId) return 1
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
			if (!data.name.includes(".")) {
				continue
			}

			if (data.type === NodeType.FILE) {
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

	private getAssociatedMetricThresholds(programmingLanguage) {
		return programmingLanguage === "java" ? metricThresholds["java"] : metricThresholds["miscellaneous"]
	}
}

export const artificialIntelligenceComponent = {
	selector: "artificialIntelligenceComponent",
	template: require("./artificialIntelligence.component.html"),
	controller: ArtificialIntelligenceController
}
