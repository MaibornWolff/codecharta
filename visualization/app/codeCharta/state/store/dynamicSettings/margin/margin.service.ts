import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { MarginActions, setMargin } from "./margin.actions"
import _ from "lodash"
import { CodeMapNode } from "../../../../codeCharta.model"
import { getResetMargin } from "./margin.reset"
import { CodeMapPreRenderService } from "../../../../ui/codeMap/codeMap.preRender.service"
import { DynamicMarginService, DynamicMarginSubscriber } from "../../appSettings/dynamicMargin/dynamicMargin.service"
import { AreaMetricService, AreaMetricSubscriber } from "../areaMetric/areaMetric.service"

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
		StoreService.subscribe($rootScope, this)
		AreaMetricService.subscribe(this.$rootScope, this)
		DynamicMarginService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(MarginActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	public onAreaMetricChanged(areaMetric: string) {
		this.reset()
	}

	public onDynamicMarginChanged(dynamicMargin: boolean) {
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
		$rootScope.$on(MarginService.MARGIN_CHANGED_EVENT, (event, data) => {
			subscriber.onMarginChanged(data.margin)
		})
	}
}
