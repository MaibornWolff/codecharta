import "./metricDeltaSelected.component.scss"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { IRootScopeService, ITimeoutService } from "angular"
import { BuildingSelectedEventSubscriber, ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { StoreService } from "../../state/store.service"
import { MapColorsService, MapColorsSubscriber } from "../../state/store/appSettings/mapColors/mapColors.service"

export class MetricDeltaSelectedController implements BuildingSelectedEventSubscriber, MapColorsSubscriber {
	private static TIME_TO_INIT_BINDING = 50
	private attributekey: string // angular bindings do not accept camelCase

	private _viewModel: {
		deltaValue: number
		attributeKey: string
		style: { color: string }
	} = {
		deltaValue: null,
		attributeKey: null,
		style: { color: null }
	}

	constructor(
		private $rootScope: IRootScopeService,
		private $timeout: ITimeoutService,
		private threeSceneService: ThreeSceneService,
		private storeService: StoreService
	) {
		"ngInject"
		ThreeSceneService.subscribeToBuildingSelectedEvents(this.$rootScope, this)
		MapColorsService.subscribe(this.$rootScope, this)
		this.$timeout(() => {
			this.onBuildingSelected(this.threeSceneService.getSelectedBuilding())
		}, MetricDeltaSelectedController.TIME_TO_INIT_BINDING)
	}

	onMapColorsChanged() {
		this.setDeltaColorClass()
	}

	onBuildingSelected(selectedBuilding?: CodeMapBuilding) {
		this.setDeltaValue(selectedBuilding)
		this.setDeltaColorClass()
	}

	private setDeltaValue(selectedBuilding?: CodeMapBuilding) {
		if (selectedBuilding) {
			this._viewModel.deltaValue = selectedBuilding.node.deltas?.[this.attributekey]
		}
	}

	private setDeltaColorClass() {
		const mapColors = this.storeService.getState().appSettings.mapColors
		const color = this._viewModel.deltaValue > 0 ? mapColors.positiveDelta : mapColors.negativeDelta
		this._viewModel.style = { color }
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
