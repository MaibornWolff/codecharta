import { SettingsService } from "../../state/settingsService/settings.service"
import "./colorSettingsPanel.component.scss"
import { FileState, MetricData } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { FileStateService, FileStateServiceSubscriber } from "../../state/fileState.service"
import { MetricService, MetricServiceSubscriber } from "../../state/metric.service"
import { FileStateHelper } from "../../util/fileStateHelper"
import _ from "lodash"
import { StoreService } from "../../state/store.service"
import { setInvertColorRange } from "../../state/store/appSettings/invertColorRange/invertColorRange.actions"
import { setInvertDeltaColors } from "../../state/store/appSettings/invertDeltaColors/invertDeltaColors.actions"
import { setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"
import { setWhiteColorBuildings } from "../../state/store/appSettings/whiteColorBuildings/whiteColorBuildings.actions"
import { setColorRange } from "../../state/store/dynamicSettings/colorRange/colorRange.actions"
import {
	InvertDeltaColorsService,
	InvertDeltaColorsSubscriber
} from "../../state/store/appSettings/invertDeltaColors/invertDeltaColors.service"
import {
	WhiteColorBuildingsService,
	WhiteColorBuildingsSubscriber
} from "../../state/store/appSettings/whiteColorBuildings/whiteColorBuildings.service"
import {
	InvertColorRangeService,
	InvertColorRangeSubscriber
} from "../../state/store/appSettings/invertColorRange/invertColorRange.service"
import { ColorMetricService, ColorMetricSubscriber } from "../../state/store/dynamicSettings/colorMetric/colorMetric.service"

export class ColorSettingsPanelController
	implements
		FileStateServiceSubscriber,
		MetricServiceSubscriber,
		InvertDeltaColorsSubscriber,
		WhiteColorBuildingsSubscriber,
		InvertColorRangeSubscriber,
		ColorMetricSubscriber {
	private lastColorMetric: string = null
	private lastMaxColorMetricValue: number = null

	private _viewModel: {
		invertColorRange: boolean
		invertDeltaColors: boolean
		whiteColorBuildings: boolean
		isDeltaState: boolean
	} = {
		invertColorRange: null,
		invertDeltaColors: null,
		whiteColorBuildings: null,
		isDeltaState: null
	}

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private settingsService: SettingsService,
		private storeService: StoreService,
		private metricService: MetricService
	) {
		FileStateService.subscribe(this.$rootScope, this)
		MetricService.subscribe(this.$rootScope, this)
		InvertDeltaColorsService.subscribe(this.$rootScope, this)
		WhiteColorBuildingsService.subscribe(this.$rootScope, this)
		InvertColorRangeService.subscribe(this.$rootScope, this)
		ColorMetricService.subscribe(this.$rootScope, this)
	}

	public onInvertColorRangeChanged(invertColorRange: boolean) {
		this._viewModel.invertColorRange = invertColorRange
	}

	public onInvertDeltaColorsChanged(invertDeltaColors: boolean) {
		this._viewModel.invertDeltaColors = invertDeltaColors
	}

	public onWhiteColorBuildingsChanged(whiteColorBuildings: boolean) {
		this._viewModel.whiteColorBuildings = whiteColorBuildings
	}

	public onColorMetricChanged(colorMetric: string) {
		if ((this.lastColorMetric !== colorMetric || !this.containsColorRangeValues()) && this.metricService.getMetricData()) {
			this.lastColorMetric = colorMetric
			const maxMetricValue = this.metricService.getMaxMetricByMetricName(colorMetric)
			this.adaptColorRange(maxMetricValue)
		}
	}

	public onFileSelectionStatesChanged(fileStates: FileState[]) {
		this._viewModel.isDeltaState = FileStateHelper.isDeltaState(fileStates)
	}

	public onImportedFilesChanged(fileStates: FileState[]) {}

	public onMetricDataAdded(metricData: MetricData[]) {
		const newMaxColorMetricValue: number = this.metricService.getMaxMetricByMetricName(
			this.settingsService.getSettings().dynamicSettings.colorMetric
		)
		if (this.lastMaxColorMetricValue !== newMaxColorMetricValue) {
			this.lastMaxColorMetricValue = newMaxColorMetricValue
			this.adaptColorRange(newMaxColorMetricValue)
		}
	}

	public onMetricDataRemoved() {}

	public invertColorRange() {
		this.settingsService.updateSettings({
			appSettings: {
				invertColorRange: this._viewModel.invertColorRange
			}
		})
		this.storeService.dispatch(setInvertColorRange(this._viewModel.invertColorRange))
	}

	public invertDeltaColors() {
		const positiveDelta = this.settingsService.getSettings().appSettings.mapColors.positiveDelta
		const negativeDelta = this.settingsService.getSettings().appSettings.mapColors.negativeDelta

		this.settingsService.updateSettings({
			appSettings: {
				invertDeltaColors: this._viewModel.invertDeltaColors,
				mapColors: {
					negativeDelta: positiveDelta,
					positiveDelta: negativeDelta
				}
			}
		})
		this.storeService.dispatch(setInvertDeltaColors(this._viewModel.invertDeltaColors))
		this.storeService.dispatch(
			setMapColors({
				...this.settingsService.getSettings().appSettings.mapColors,
				negativeDelta: positiveDelta,
				positiveDelta: negativeDelta
			})
		)
	}

	public applyWhiteColorBuildings() {
		this.settingsService.updateSettings({
			appSettings: {
				whiteColorBuildings: this._viewModel.whiteColorBuildings
			}
		})
		this.storeService.dispatch(setWhiteColorBuildings(this._viewModel.whiteColorBuildings))
	}

	private containsColorRangeValues(): boolean {
		return _.values(this.storeService.getState().dynamicSettings.colorRange).every(x => x != null)
	}

	private adaptColorRange(maxMetricValue: number) {
		const firstThird = Math.round((maxMetricValue / 3) * 100) / 100
		const secondThird = Math.round(firstThird * 2 * 100) / 100

		this.settingsService.updateSettings({
			dynamicSettings: {
				colorRange: {
					from: firstThird,
					to: secondThird
				}
			}
		})
		this.storeService.dispatch(setColorRange({ from: firstThird, to: secondThird }))
	}
}

export const colorSettingsPanelComponent = {
	selector: "colorSettingsPanelComponent",
	template: require("./colorSettingsPanel.component.html"),
	controller: ColorSettingsPanelController
}
