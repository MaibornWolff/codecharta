import "./attributeSideBar.component.scss"
import { ITimeoutService, IRootScopeService } from "angular"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import {
	CodeMapMouseEventService,
	BuildingSelectedEventSubscriber,
	BuildingDeselectedEventSubscriber
} from "../codeMap/codeMap.mouseEvent.service"
import { KeyValuePair } from "../../codeCharta.model"
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
		primaryMetrics: PrimaryMetrics
		attributeKeys: string[]
		attributes: KeyValuePair
	} = {
		primaryMetrics: {} as PrimaryMetrics,
		attributeKeys: null,
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
		this._viewModel.attributeKeys = _.keys(selectedBuilding.node.attributes).filter(
			x => !_.values(this._viewModel.primaryMetrics).includes(x)
		)
		this._viewModel.attributes = selectedBuilding.node.attributes
		//this.toggleAttributeSideBar()
	}

	public onBuildingDeselected() {
		this._viewModel.attributeKeys = null
		this._viewModel.attributes = null
	}

	public onAreaMetricChanged(areaMetric: string) {
		this._viewModel.primaryMetrics.area = areaMetric
	}

	public onHeightMetricChanged(heightMetric: string) {
		this._viewModel.primaryMetrics.height = heightMetric
	}

	public onColorMetricChanged(colorMetric: string) {
		this._viewModel.primaryMetrics.color = colorMetric
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
