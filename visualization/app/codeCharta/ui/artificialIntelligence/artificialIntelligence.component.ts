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
import { clusterMetricThresholds } from "./artificialIntelligence.clusterMetricThresholds"
import { defaultMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"
import { setState } from "../../state/store/state.actions"
import { setColorRange } from "../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { setMargin } from "../../state/store/dynamicSettings/margin/margin.actions"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCameraService"
import { setCamera } from "../../state/store/appSettings/camera/camera.actions"
import { setCameraTarget } from "../../state/store/appSettings/cameraTarget/cameraTarget.actions"
import { Vector3 } from "three"

interface MetricValues {
	[metric: string]: number[]
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

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private threeOrbitControlsService: ThreeOrbitControlsService,
		private threeCameraService: ThreeCameraService
	) {
		FilesService.subscribe(this.$rootScope, this)
	}

	applyCustomConfig(configId: string) {
		const customConfig = CustomConfigHelper.getCustomConfigSettings(configId)

		// TODO: Setting state from loaded CustomConfig not working at the moment
		//  due to issues of the event architecture.

		// TODO: Check if state properties differ
		// Create new partial State (updates) for changed values only
		this.storeService.dispatch(setState(customConfig.stateSettings))

		// Should we fire another event "ResettingStateFinishedEvent"
		// We could add a listener then to reset the camera

		this.storeService.dispatch(setColorRange(customConfig.stateSettings.dynamicSettings.colorRange as ColorRange))
		this.storeService.dispatch(setMargin(customConfig.stateSettings.dynamicSettings.margin))

		// TODO: remove this dirty timeout and set camera settings properly
		// This timeout is a chance that CustomConfigs for a small map can be restored and applied completely (even the camera positions)
		setTimeout(() => {
			this.threeCameraService.setPosition()
			this.threeOrbitControlsService.setControlTarget()

			this.storeService.dispatch(setCamera(customConfig.stateSettings.appSettings.camera as Vector3))
			this.storeService.dispatch(setCameraTarget(customConfig.stateSettings.appSettings.cameraTarget as Vector3))
		}, 100)
	}

	onFilesSelectionChanged(files: FileState[]) {
		const suspiciousMetricsSuggestions = new Map<string, ColorRange>()
		const outlierLimits = new Map<string, number>()
		const unsuspiciousMetrics = []

		const fileState = getVisibleFileStates(files)[0]
		if (fileState === undefined) {
			return
		}

		if (!this.hasJavaFiles(fileState.file.map)) {
			return
		}

		const metricValues = this.getMetricValues(fileState)

		let totalRloc = 0
		let numberOfRlocLowRisk = 0
		let numberOfRlocModerateRisk = 0
		let numberOfRlocHighRisk = 0
		let numberOfRlocVeryHighRisk = 0

		for (const { data } of hierarchy(fileState.file.map)) {
			if (data.type !== NodeType.FILE) {
				continue
			}

			if (data.attributes["mcc"] === undefined || data.attributes["rloc"] === undefined) {
				continue
			}

			totalRloc += data.attributes["rloc"]

			// We could calculate risk profiles per directory
			if (data.attributes["mcc"] <= clusterMetricThresholds["java"]["notClustered"]["mcc"].percentile70) {
				numberOfRlocLowRisk += data.attributes["rloc"]
			} else if (data.attributes["mcc"] <= clusterMetricThresholds["java"]["notClustered"]["mcc"].percentile80) {
				numberOfRlocModerateRisk += data.attributes["rloc"]
			} else if (data.attributes["mcc"] <= clusterMetricThresholds["java"]["notClustered"]["mcc"].percentile90) {
				numberOfRlocHighRisk += data.attributes["rloc"]
			} else {
				numberOfRlocVeryHighRisk += data.attributes["rloc"]
			}
		}

		this._viewModel.riskProfile.lowRisk = Math.ceil((numberOfRlocLowRisk / totalRloc) * 100)
		this._viewModel.riskProfile.moderateRisk = Math.ceil((numberOfRlocModerateRisk / totalRloc) * 100)
		this._viewModel.riskProfile.highRisk = Math.ceil((numberOfRlocHighRisk / totalRloc) * 100)
		this._viewModel.riskProfile.veryHighRisk = Math.ceil((numberOfRlocVeryHighRisk / totalRloc) * 100)

		for (const metricName of Object.keys(clusterMetricThresholds["java"]["notClustered"])) {
			const valuesOfMetric = metricValues[metricName]
			if (valuesOfMetric === undefined) {
				continue
			}

			const thresholdConfig = clusterMetricThresholds["java"]["notClustered"][metricName]
			const maxMetricValue = Math.max(...valuesOfMetric)

			if (maxMetricValue > thresholdConfig.percentile70) {
				suspiciousMetricsSuggestions.set(metricName, { from: thresholdConfig.percentile70, to: thresholdConfig.percentile80 })

				if (maxMetricValue > thresholdConfig.percentile90) {
					outlierLimits.set(metricName, thresholdConfig.percentile90)
				}
			} else {
				unsuspiciousMetrics.push(metricName)
			}
		}

		const noticeableMetricSuggestionLinks = new Map<string, MetricSuggestionParameters>()

		for (const [metricName, colorRange] of suspiciousMetricsSuggestions) {
			const overviewConfigState = this.prepareOverviewConfigState(metricName, colorRange.from, colorRange.to)
			const overviewConfigName = `Suspicious ${metricName.toUpperCase()} Files (AI)`
			const overviewConfig = this.createAndAddCustomConfig(overviewConfigName, overviewConfigState, fileState)

			noticeableMetricSuggestionLinks.set(metricName, {
				metric: metricName,
				...colorRange,
				generalCustomConfigId: overviewConfig.id
			})

			const outlierThreshold = outlierLimits.get(metricName)
			if (outlierThreshold > 0) {
				const outlierToValue = outlierThreshold
				const outlierFromValue = outlierToValue - 1

				const outlierConfigState = this.prepareOutlierConfigState(metricName, outlierFromValue, outlierToValue)
				const outlierConfigName = `Very High Risk ${metricName.toUpperCase()} Files (AI)`
				const outlierConfig = this.createAndAddCustomConfig(outlierConfigName, outlierConfigState, fileState)

				noticeableMetricSuggestionLinks.get(metricName).outlierCustomConfigId = outlierConfig.id
			}
		}

		this._viewModel.suspiciousMetricSuggestionLinks = [...noticeableMetricSuggestionLinks.values()]
		this._viewModel.unsuspiciousMetrics = unsuspiciousMetrics
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

	private getMetricValues(fileState: FileState): MetricValues {
		const metricValues: MetricValues = {}

		for (const { data } of hierarchy(fileState.file.map)) {
			if (data.type !== NodeType.FILE) {
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

	private hasJavaFiles(map) {
		for (const { data } of hierarchy(map)) {
			if (data.type === NodeType.FILE && data.name.includes(".java")) {
				return true
			}
		}
		return false
	}
}

export const artificialIntelligenceComponent = {
	selector: "artificialIntelligenceComponent",
	template: require("./artificialIntelligence.component.html"),
	controller: ArtificialIntelligenceController
}
