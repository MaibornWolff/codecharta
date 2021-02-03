import "./artificialIntelligence.component.scss"
import { FilesSelectionSubscriber, FilesService } from "../../state/store/files/files.service"
import { FileSelectionState, FileState } from "../../model/files/files"
import { IRootScopeService } from "angular"
import { buildCustomConfigFromState } from "../../util/customConfigBuilder"
import { CustomConfigHelper } from "../../util/customConfigHelper"
import { StoreService } from "../../state/store.service"
import { klona } from "klona"
import { CustomConfigMapSelectionMode } from "../../model/customConfig/customConfig.api.model"
import { getMedian, pushSorted } from "../../util/nodeDecorator"
import { NodeType } from "../../codeCharta.model"
import { hierarchy } from "d3-hierarchy"

type OutlierConfig = {
	threshold: number
}

export class ArtificialIntelligenceController implements FilesSelectionSubscriber {
	private metricsOutlierConfig: Map<string, OutlierConfig> = new Map([
		["mcc", { threshold: 15 }],
		["loc", { threshold: 1000 }],
		["rloc", { threshold: 1000 }],
		["cognitive_complexity", { threshold: 10 }],
		["code_smell", { threshold: 25 }],
		["bug", { threshold: 10 }],
		["functions", { threshold: 20 }],
		["statements", { threshold: 150 }]
	])

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		FilesService.subscribe(this.$rootScope, this)
	}

	onFilesSelectionChanged(files: FileState[]) {
		const outliersFound = new Map<string, number>()

		for (const fileState of files) {
			if (fileState.selectedAs !== FileSelectionState.None) {
				const metricValues = this.getMetricValues(fileState)

				for (const [metricName, outlierConfig] of this.metricsOutlierConfig) {
					if (metricValues[metricName] === undefined) {
						continue
					}

					const outliers = this.detectOutliers(metricValues[metricName], outlierConfig)
					if (outliers.length > 0) {
						outliersFound.set(metricName, Math.min(...outliers) - 1)
					}
				}
			}
		}

		//const rlocOutlier = outliersFound.get("rloc")
		//const functionsOutlier = outliersFound.get("functions")
		const mccOutlier = outliersFound.get("mcc")
		const bugOutlier = outliersFound.get("bug")

		// Just make one static suggestion if possible
		if (mccOutlier && bugOutlier) {
			const state = klona(this.storeService.getState())
			state.dynamicSettings.areaMetric = "mcc"
			state.dynamicSettings.heightMetric = "bug"
			state.dynamicSettings.colorMetric = "bug"
			state.dynamicSettings.colorRange.to = bugOutlier.valueOf()

			const configName = "Buggy Classes (AI)"
			const customConfig = buildCustomConfigFromState(configName, state)
			if (
				!CustomConfigHelper.hasCustomConfigByName(
					CustomConfigMapSelectionMode.SINGLE,
					[state.files[0].file.fileMeta.fileName],
					configName
				)
			) {
				CustomConfigHelper.addCustomConfig(customConfig)
			}
		}
	}

	private getMetricValues(fileState: FileState) {
		const metricValues: { [metric: string]: number[] } = {}

		for (const { data } of hierarchy(fileState.file.map)) {
			if (data.type === NodeType.FILE) {
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
		}

		return metricValues
	}

	private detectOutliers(metricValues: number[], outlierConfig: OutlierConfig) {
		let outliers: number[] = []

		//let euklideanDistanceToAverage = 0
		//for (const metricValue of metricValues) {
		//euklideanDistanceToAverage = (metricValue - metricStatistics.average) ** 2
		//}

		//const variance = euklideanDistanceToAverage / metricValues.length
		//const standardVariation = Math.sqrt(variance)

		let valuesFirstHalf: number[]
		let valuesSecondHalf: number[]

		if (metricValues.length % 2 === 0) {
			valuesFirstHalf = metricValues.slice(0, metricValues.length / 2)
			valuesSecondHalf = metricValues.slice(metricValues.length / 2, metricValues.length)
		} else {
			valuesFirstHalf = metricValues.slice(0, metricValues.length / 2)
			valuesSecondHalf = metricValues.slice(metricValues.length / 2 + 1, metricValues.length)
		}

		const firstQuartil = getMedian(valuesFirstHalf)
		//const median_second_quartil = getMedian(metricValues)
		const thirdQuartil = getMedian(valuesSecondHalf)

		const interQuartilRange = thirdQuartil - firstQuartil
		const upperOutlierBound = thirdQuartil + 1.5 * interQuartilRange

		outliers = metricValues.filter(function (value) {
			return value > upperOutlierBound || value > outlierConfig.threshold
		})

		return outliers
	}
}

export const artificialIntelligenceComponent = {
	selector: "artificialIntelligenceComponent",
	template: require("./artificialIntelligence.component.html"),
	controller: ArtificialIntelligenceController
}
