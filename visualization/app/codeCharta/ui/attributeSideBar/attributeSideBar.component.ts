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
import { AreaMetricSubscriber, HeightMetricSubscriber, ColorMetricSubscriber } from "../../state/settingsService/settings.service.events"
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
		SIDENAV_ID: string
		node: Node
		primaryMetricKeys: PrimaryMetrics
		secondaryMetricKeys: string[]
	} = {
		SIDENAV_ID: "attribute-side-bar-right",
		node: null,
		primaryMetricKeys: {} as PrimaryMetrics,
		secondaryMetricKeys: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private $timeout: ITimeoutService, private $mdSidenav: any) {
		CodeMapMouseEventService.subscribeToBuildingSelectedEvents(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingDeselectedEvents(this.$rootScope, this)
		SettingsService.subscribeToAreaMetric(this.$rootScope, this)
		SettingsService.subscribeToHeightMetric(this.$rootScope, this)
		SettingsService.subscribeToColorMetric(this.$rootScope, this)
	}

	public onBuildingSelected(selectedBuilding: CodeMapBuilding) {
		this._viewModel.node = selectedBuilding.node
		this._viewModel.secondaryMetricKeys = this.getSortedMetricKeysWithoutPrimaryMetrics(selectedBuilding)
		this.openSideBar()
		this.synchronizeAngularTwoWayBinding()
	}

	public onBuildingDeselected() {
		this.closeSideBar()
		this.synchronizeAngularTwoWayBinding()
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

	public closeSideBar() {
		this.$mdSidenav(this._viewModel.SIDENAV_ID).close()
	}

	public openSideBar() {
		this.$mdSidenav(this._viewModel.SIDENAV_ID).open()
	}

	private getSortedMetricKeysWithoutPrimaryMetrics(selectedBuilding: CodeMapBuilding) {
		return _.keys(selectedBuilding.node.attributes)
			.filter(x => !_.values(this._viewModel.primaryMetricKeys).includes(x))
			.sort()
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
