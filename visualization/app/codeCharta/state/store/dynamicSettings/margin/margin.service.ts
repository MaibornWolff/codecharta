import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { MarginActions, setMargin } from "./margin.actions"
import { CodeMapNode } from "../../../../codeCharta.model"
import { getResetMargin } from "./margin.reset"
import { CodeMapPreRenderService } from "../../../../ui/codeMap/codeMap.preRender.service"
import { DynamicMarginService, DynamicMarginSubscriber } from "../../appSettings/dynamicMargin/dynamicMargin.service"
import { AreaMetricService, AreaMetricSubscriber } from "../areaMetric/areaMetric.service"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface MarginSubscriber {
	onMarginChanged(margin: number)
}

export class MarginService implements StoreSubscriber, DynamicMarginSubscriber, AreaMetricSubscriber {
	private static MARGIN_CHANGED_EVENT = "margin-changed"

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private codeMapPreRenderService: CodeMapPreRenderService
	) {
		StoreService.subscribe(this.$rootScope, this)
		AreaMetricService.subscribe(this.$rootScope, this)
		DynamicMarginService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, MarginActions)) {
			this.notify(this.select())
		}
	}

	public onAreaMetricChanged() {
		this.reset()
	}

	public onDynamicMarginChanged() {
		this.reset()
	}

	public reset() {
		const map: CodeMapNode = this.codeMapPreRenderService.getRenderMap()
		const areaMetric = this.storeService.getState().dynamicSettings.areaMetric
		const margin = this.storeService.getState().dynamicSettings.margin
		const dynamicMargin = this.storeService.getState().appSettings.dynamicMargin

		const newMargin = getResetMargin(dynamicMargin, map, areaMetric)

		if (newMargin && newMargin !== margin) {
			this.storeService.dispatch(setMargin(newMargin))
		}
	}

	private select() {
		return this.storeService.getState().dynamicSettings.margin
	}

	private notify(newState: number) {
		this.$rootScope.$broadcast(MarginService.MARGIN_CHANGED_EVENT, { margin: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: MarginSubscriber) {
		$rootScope.$on(MarginService.MARGIN_CHANGED_EVENT, (_event, data) => {
			subscriber.onMarginChanged(data.margin)
		})
	}
}
