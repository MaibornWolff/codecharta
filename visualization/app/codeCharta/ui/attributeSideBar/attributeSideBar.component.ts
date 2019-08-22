import "./attributeSideBar.component.scss"
import { ITimeoutService, IRootScopeService } from "angular"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import {
	CodeMapMouseEventService,
	BuildingSelectedEventSubscriber,
	BuildingDeselectedEventSubscriber
} from "../codeMap/codeMap.mouseEvent.service"
import { KeyValuePair, Node } from "../../codeCharta.model"
import _ from "lodash"
import {
	SettingsEvents,
	AreaMetricSubscriber,
	HeightMetricSubscriber,
	ColorMetricSubscriber
} from "../../state/settingsService/settings.service.events"
import { SettingsService } from "../../state/settingsService/settings.service"

interface PrimaryMetrics {
	area: string
	color: string
	height: string
}

export class AttributeSideBarController
	implements
		BuildingSelectedEventSubscriber,
		BuildingDeselectedEventSubscriber,
		AreaMetricSubscriber,
		HeightMetricSubscriber,
		ColorMetricSubscriber {
	private _viewModel: {
		nodeName: string
		nodePath: string
		primaryMetricKeys: PrimaryMetrics
		secondaryMetricKeys: string[]
		deltas: KeyValuePair
		attributes: KeyValuePair
	} = {
		nodeName: null,
		nodePath: null,
		primaryMetricKeys: {} as PrimaryMetrics,
		secondaryMetricKeys: null,
		deltas: null,
		attributes: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private $mdSidenav: any, private $timeout: ITimeoutService) {
		this.toggleAttributeSideBar()

		CodeMapMouseEventService.subscribeToBuildingSelectedEvents(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingDeselectedEvents(this.$rootScope, this)
		SettingsService.subscribeToAreaMetric(this.$rootScope, this)
		SettingsService.subscribeToHeightMetric(this.$rootScope, this)
		SettingsService.subscribeToColorMetric(this.$rootScope, this)
	}

	public onBuildingSelected(selectedBuilding: CodeMapBuilding) {
		const node: Node = selectedBuilding.node

		this._viewModel.nodeName = node.name
		this._viewModel.nodePath = node.path
		this._viewModel.secondaryMetricKeys = _.keys(node.attributes)
			.filter(x => !_.values(this._viewModel.primaryMetricKeys).includes(x))
			.sort()
		this._viewModel.attributes = node.attributes
		this._viewModel.deltas = node.deltas
		//this.toggleAttributeSideBar()
	}

	public onBuildingDeselected() {
		this._viewModel.secondaryMetricKeys = null
		this._viewModel.attributes = null
	}

	public onAreaMetricChanged(areaMetric: string) {
		this._viewModel.primaryMetricKeys.area = areaMetric
	}

	public onHeightMetricChanged(heightMetric: string) {
		this._viewModel.primaryMetricKeys.height = heightMetric
	}

	public onColorMetricChanged(colorMetric: string) {
		this._viewModel.primaryMetricKeys.color = colorMetric
	}

	public toggleAttributeSideBar() {
		this.$timeout(() => {
			this.$mdSidenav("right").toggle()
		}, 200)
	}
}

export const attributeSideBarComponent = {
	selector: "attributeSideBarComponent",
	template: require("./attributeSideBar.component.html"),
	controller: AttributeSideBarController
}
