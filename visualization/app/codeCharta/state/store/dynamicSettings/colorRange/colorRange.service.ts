import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { ColorRangeActions, setColorRange } from "./colorRange.actions"
import { ColorRange } from "../../../../codeCharta.model"
import { getResetColorRange } from "./colorRange.reset"
import { MetricService } from "../../../metric.service"
import { ColorMetricService, ColorMetricSubscriber } from "../colorMetric/colorMetric.service"
import { FilesService, FilesSelectionSubscriber } from "../../files/files.service"
import { Files } from "../../../../model/files"
import { isActionOfType } from "../../../../util/actionHelper"

export interface ColorRangeSubscriber {
	onColorRangeChanged(colorRange: ColorRange)
}

export class ColorRangeService implements StoreSubscriber, ColorMetricSubscriber, FilesSelectionSubscriber {
	private static COLOR_RANGE_CHANGED_EVENT = "color-range-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService, private metricService: MetricService) {
		StoreService.subscribe(this.$rootScope, this)
		ColorMetricService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, ColorRangeActions)) {
			this.notify(this.select())
			this.tryToResetIfNull()
		}
	}

	public onColorMetricChanged(colorMetric: string) {
		this.reset()
	}

	public onFilesSelectionChanged(files: Files) {
		this.reset()
	}

	private tryToResetIfNull() {
		const colorRange = this.storeService.getState().dynamicSettings.colorRange
		const colorMetric = this.storeService.getState().dynamicSettings.colorMetric
		const maxMetricValue: number = this.metricService.getMaxMetricByMetricName(colorMetric)
		if (!colorRange.from && !colorRange.to && maxMetricValue) {
			this.reset()
		}
	}

	public reset() {
		const colorMetric = this.storeService.getState().dynamicSettings.colorMetric
		const maxMetricValue: number = this.metricService.getMaxMetricByMetricName(colorMetric)

		const newColorRange = getResetColorRange(maxMetricValue)
		this.storeService.dispatch(setColorRange(newColorRange))
	}

	private select() {
		return this.storeService.getState().dynamicSettings.colorRange
	}

	private notify(newState: ColorRange) {
		this.$rootScope.$broadcast(ColorRangeService.COLOR_RANGE_CHANGED_EVENT, { colorRange: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: ColorRangeSubscriber) {
		$rootScope.$on(ColorRangeService.COLOR_RANGE_CHANGED_EVENT, (event, data) => {
			subscriber.onColorRangeChanged(data.colorRange)
		})
	}
}
