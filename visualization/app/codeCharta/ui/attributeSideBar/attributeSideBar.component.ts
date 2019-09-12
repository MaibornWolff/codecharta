import "./attributeSideBar.component.scss"
import { IRootScopeService, ITimeoutService } from "angular"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import {
	CodeMapMouseEventService,
	BuildingSelectedEventSubscriber,
	BuildingDeselectedEventSubscriber
} from "../codeMap/codeMap.mouseEvent.service"
import { Node } from "../../codeCharta.model"
import _ from "lodash"
import {
	AreaMetricSubscriber,
	HeightMetricSubscriber,
	ColorMetricSubscriber,
	EdgeMetricSubscriber
} from "../../state/settingsService/settings.service.events"
import { SettingsService } from "../../state/settingsService/settings.service"
import { AttributeSideBarService } from "./attributeSideBar.service"
import $ from "jquery"

interface PrimaryMetrics {
	area: string
	color: string
	height: string
	edge: string
}

export class AttributeSideBarController
	implements
		BuildingSelectedEventSubscriber,
		BuildingDeselectedEventSubscriber,
		AreaMetricSubscriber,
		HeightMetricSubscriber,
		ColorMetricSubscriber,
		EdgeMetricSubscriber {
	private _viewModel: {
		node: Node
		primaryMetricKeys: PrimaryMetrics
		secondaryMetricKeys: string[]
	} = {
		node: null,
		primaryMetricKeys: {} as PrimaryMetrics,
		secondaryMetricKeys: null
	}

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private $timeout: ITimeoutService,
		private attributeSideBarService: AttributeSideBarService
	) {
		CodeMapMouseEventService.subscribeToBuildingSelectedEvents(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingDeselectedEvents(this.$rootScope, this)
		SettingsService.subscribeToAreaMetric(this.$rootScope, this)
		SettingsService.subscribeToHeightMetric(this.$rootScope, this)
		SettingsService.subscribeToColorMetric(this.$rootScope, this)
		SettingsService.subscribeToEdgeMetric(this.$rootScope, this)
	}

	public onBuildingSelected(selectedBuilding: CodeMapBuilding) {
		this._viewModel.node = selectedBuilding.node
		this.updateSortedMetricKeysWithoutPrimaryMetrics()
		this.openSideBar()
		this.synchronizeAngularTwoWayBinding()
	}

	public onBuildingDeselected() {
		this.closeSideBar()
		this.synchronizeAngularTwoWayBinding()
	}

	public onAreaMetricChanged(areaMetric: string) {
		this._viewModel.primaryMetricKeys.area = areaMetric
		this.updateSortedMetricKeysWithoutPrimaryMetrics()
	}

	public onHeightMetricChanged(heightMetric: string) {
		this._viewModel.primaryMetricKeys.height = heightMetric
		this.updateSortedMetricKeysWithoutPrimaryMetrics()
	}

	public onColorMetricChanged(colorMetric: string) {
		this._viewModel.primaryMetricKeys.color = colorMetric
		this.updateSortedMetricKeysWithoutPrimaryMetrics()
	}

	public onEdgeMetricChanged(edgeMetric: string) {
		this._viewModel.primaryMetricKeys.edge = edgeMetric
		this.updateSortedMetricKeysWithoutPrimaryMetrics()
	}

	public closeSideBar() {
		$(".side-bar-container").removeClass("expanded")
		this.attributeSideBarService.closeSideBar()
	}

	public openSideBar() {
		$(".side-bar-container").addClass("expanded")
		this.attributeSideBarService.openSideBar()
	}

	private updateSortedMetricKeysWithoutPrimaryMetrics() {
		if (this._viewModel.node) {
			this._viewModel.secondaryMetricKeys = _.keys(this._viewModel.node.attributes)
				.filter(x => !_.values(this._viewModel.primaryMetricKeys).includes(x))
				.sort()
		}
	}

	private synchronizeAngularTwoWayBinding() {
		this.$timeout(() => {})
	}
}

export const attributeSideBarComponent = {
	selector: "attributeSideBarComponent",
	template: require("./attributeSideBar.component.html"),
	controller: AttributeSideBarController
}
