import "./artificialIntelligence.component.scss"
import { FilesSelectionSubscriber, FilesService } from "../../state/store/files/files.service"
import { FileSelectionState, FileState } from "../../model/files/files"
import { IRootScopeService } from "angular"
import {getMedian} from "../../util/nodeDecorator";
import {buildCustomConfigFromState} from "../../util/customConfigBuilder";
import {CustomConfigHelper} from "../../util/customConfigHelper";
import {StoreService} from "../../state/store.service";
import {setHeightMetric} from "../../state/store/dynamicSettings/heightMetric/heightMetric.actions";
import {setAreaMetric} from "../../state/store/dynamicSettings/areaMetric/areaMetric.actions";
import {setColorMetric} from "../../state/store/dynamicSettings/colorMetric/colorMetric.actions";
import {setColorRange} from "../../state/store/dynamicSettings/colorRange/colorRange.actions";

type OutlierConfig = {
	threshold: number
}

export class ArtificialIntelligenceController implements FilesSelectionSubscriber {
	// private badMetricThresholds: Map<string, number> = new Map([
	// 	["mcc", 15]
	// ])
	
	private metricsOutlierConfig: Map<string, OutlierConfig> = new Map([
		["mcc", { threshold: 20 }],
		["loc", { threshold: 1000 }],
		["rloc", { threshold: 1000 }],
		["cognitive_complexity", { threshold: 10 }],
		["code_smell", { threshold: 25 }],
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

				console.log(fileState)

				for (const [metricName, outlierConfig] of this.metricsOutlierConfig) {
					console.log(`DETECT OUTLIERS FOR ${metricName}`)
					const outliers = this.detectOutliers(metricName, outlierConfig, fileState)
					if (outliers.length > 0) {
						outliersFound.set(metricName, Math.min(...outliers) - 1)
					}
				}
			}
		}

		const rlocOutlier = outliersFound.get("rloc")
		const functionsOutlier = outliersFound.get("functions")
		const mccOutlier = outliersFound.get("mcc")
		console.log(mccOutlier)
		if (rlocOutlier && functionsOutlier && mccOutlier) {
			const state = this.storeService.getState()
			this.storeService.dispatch(setAreaMetric("rloc"))
			this.storeService.dispatch(setHeightMetric("functions"))
			this.storeService.dispatch(setColorMetric("mcc"))
			this.storeService.dispatch(setColorRange({from: state.dynamicSettings.colorRange.from, to: mccOutlier.valueOf()}))

			//TODO: clone state instead of dispatching the new settings (metrics/range)

			const customConfig = buildCustomConfigFromState("AI: RLOC/FUNC/MCC", this.storeService.getState())
			CustomConfigHelper.addCustomConfig(customConfig)
		}

		console.log(outliersFound)
	}

	private detectOutliers(metricName: string, outlierConfig: OutlierConfig, fileState: FileState) {
		let outliers: number[] = []

		const metricStatistics = fileState.file.fileMeta.metricStatistics[metricName]
		if (!metricStatistics) {
			return outliers
		}

		let metricValues = metricStatistics.values
		metricValues = metricValues.filter(function (metricValue) {
			return metricValue > 0
		})

		//let euklideanDistanceToAverage = 0
		//for (const metricValue of metricValues) {
			//euklideanDistanceToAverage = (metricValue - metricStatistics.average) ** 2
		//}

		//const variance = euklideanDistanceToAverage / metricValues.length
		//const standardVariation = Math.sqrt(variance)

		//console.log(variance, standardVariation)

		let valuesFirstHalf: number[]
		let valuesSecondHalf: number[]

		if (metricValues.length % 2 === 0) {
			valuesFirstHalf = metricValues.slice(0, metricValues.length / 2);
			valuesSecondHalf = metricValues.slice(metricValues.length / 2, metricValues.length);
		} else {
			valuesFirstHalf = metricValues.slice(0, metricValues.length / 2);
			valuesSecondHalf = metricValues.slice(metricValues.length / 2 + 1, metricValues.length);
		}

		const firstQuartil = getMedian(valuesFirstHalf)
		//const median_second_quartil = getMedian(metricValues)
		const thirdQuartil = getMedian(valuesSecondHalf)

		const interQuartilRange = thirdQuartil - firstQuartil
		const upperOutlierBound = thirdQuartil + 1.5 * interQuartilRange

		//console.log(valuesFirstHalf, valuesSecondHalf, firstQuartil, thirdQuartil, interQuartilRange, upperOutlierBound)

		outliers = metricValues.filter(function (value) {
			if (!(value > upperOutlierBound) && value > outlierConfig.threshold) {
				console.log("THREEEEEEESHOLD FALLLLLLLLBACK")
				console.log("upperOutlierBound", upperOutlierBound)
			}
			return value > upperOutlierBound || value > outlierConfig.threshold
		})

		console.log(outliers)

		return outliers
	}
}

export const artificialIntelligenceComponent = {
	selector: "artificialIntelligenceComponent",
	template: require("./artificialIntelligence.component.html"),
	controller: ArtificialIntelligenceController
}
