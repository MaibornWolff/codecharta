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

export class AttributeSideBarController implements BuildingSelectedEventSubscriber, BuildingDeselectedEventSubscriber {
	private _viewModel: {
		attributeKeys: string[]
		attributes: KeyValuePair
	} = {
		attributeKeys: null,
		attributes: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private $mdSidenav: any, private $timeout: ITimeoutService) {
		//this.toggleAttributeSideBar()

		CodeMapMouseEventService.subscribeToBuildingSelectedEvents(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingDeselectedEvents(this.$rootScope, this)
	}

	public onBuildingSelected(selectedBuilding: CodeMapBuilding) {
		this._viewModel.attributeKeys = _.keys(selectedBuilding.node.attributes)
		this._viewModel.attributes = selectedBuilding.node.attributes
		this.toggleAttributeSideBar()
	}

	public onBuildingDeselected() {
		this.toggleAttributeSideBar()
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
