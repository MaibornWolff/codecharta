import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { ColorRangeActions, setColorRange } from "./colorRange.actions"
import { ColorRange } from "../../../../codeCharta.model"
import { getResetColorRange } from "./colorRange.reset"
import { ColorMetricService, ColorMetricSubscriber } from "../colorMetric/colorMetric.service"
import { FilesService, FilesSelectionSubscriber } from "../../files/files.service"
import { isActionOfType } from "../../../../util/reduxHelper"
import { NodeMetricDataService } from "../../metricData/nodeMetricData/nodeMetricData.service"

export interface ColorRangeSubscriber {
	onColorRangeChanged(colorRange: ColorRange)
}

export class ColorRangeService implements StoreSubscriber, ColorMetricSubscriber, FilesSelectionSubscriber {
	private static COLOR_RANGE_CHANGED_EVENT = "color-range-changed"

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private nodeMetricDataService: NodeMetricDataService
	) {
		StoreService.subscribe(this.$rootScope, this)
		ColorMetricService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, ColorRangeActions)) {
			this.notify(this.select())
			this.tryToResetIfNull()
		}
	}

	onColorMetricChanged() {
		this.reset()
	}

	onFilesSelectionChanged() {
		this.reset()
	}

	private tryToResetIfNull() {
		const { colorRange, colorMetric } = this.storeService.getState().dynamicSettings
		const maxMetricValue = this.nodeMetricDataService.getMaxMetricByMetricName(colorMetric)
		if (!colorRange.from && !colorRange.to && maxMetricValue) {
			this.reset()
		}
	}

	reset() {
		const { colorMetric } = this.storeService.getState().dynamicSettings
		const maxMetricValue = this.nodeMetricDataService.getMaxMetricByMetricName(colorMetric)

		const newColorRange = getResetColorRange(maxMetricValue)
		this.storeService.dispatch(setColorRange(newColorRange))
	}

	private select() {
		return this.storeService.getState().dynamicSettings.colorRange
	}

	private notify(newState: ColorRange) {
		this.$rootScope.$broadcast(ColorRangeService.COLOR_RANGE_CHANGED_EVENT, { colorRange: newState })
	}

	static subscribe($rootScope: IRootScopeService, subscriber: ColorRangeSubscriber) {
		$rootScope.$on(ColorRangeService.COLOR_RANGE_CHANGED_EVENT, (_event, data) => {
			subscriber.onColorRangeChanged(data.colorRange)
		})
	}
}
