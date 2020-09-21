import "./metricDeltaSelected.component.scss"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { IRootScopeService, ITimeoutService } from "angular"
import { BuildingSelectedEventSubscriber, ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { StoreService } from "../../state/store.service"
import {
	InvertDeltaColorsService,
	InvertDeltaColorsSubscriber
} from "../../state/store/appSettings/invertDeltaColors/invertDeltaColors.service"

export class MetricDeltaSelectedController implements BuildingSelectedEventSubscriber, InvertDeltaColorsSubscriber {
	private static TIME_TO_INIT_BINDING = 50
	private attributekey: string // angular bindings do not accept camelCase

	private _viewModel: {
		deltaValue: number
		colorClass: string
		attributeKey: string
	} = {
		deltaValue: null,
		colorClass: null,
		attributeKey: null
	}

	constructor(
		private $rootScope: IRootScopeService,
		private $timeout: ITimeoutService,
		private threeSceneService: ThreeSceneService,
		private storeService: StoreService
	) {
		ThreeSceneService.subscribeToBuildingSelectedEvents(this.$rootScope, this)
		InvertDeltaColorsService.subscribe(this.$rootScope, this)
		this.$timeout(() => {
			this.onBuildingSelected(this.threeSceneService.getSelectedBuilding())
		}, MetricDeltaSelectedController.TIME_TO_INIT_BINDING)
	}

	onBuildingSelected(selectedBuilding?: CodeMapBuilding) {
		this.setDeltaValue(selectedBuilding)
		this.setDeltaColorClass()
	}

	onInvertDeltaColorsChanged() {
		this.setDeltaColorClass()
	}

	private setDeltaValue(selectedBuilding?: CodeMapBuilding) {
		if (selectedBuilding) {
			this._viewModel.deltaValue = selectedBuilding.node.deltas?.[this.attributekey]
		}
	}

	private setDeltaColorClass() {
		if (this.storeService.getState().appSettings.invertDeltaColors) {
			this._viewModel.colorClass = this._viewModel.deltaValue > 0 ? "red" : "green"
		} else {
			this._viewModel.colorClass = this._viewModel.deltaValue > 0 ? "green" : "red"
		}
	}
}

export const metricDeltaSelectedComponent = {
	selector: "metricDeltaSelectedComponent",
	template: require("./metricDeltaSelected.component.html"),
	controller: MetricDeltaSelectedController,
	bindings: {
		attributekey: "="
	}
}
