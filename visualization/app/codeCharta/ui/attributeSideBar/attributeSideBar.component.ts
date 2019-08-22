import "./attributeSideBar.component.scss"
import { ITimeoutService, IRootScopeService } from "angular"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import {
	CodeMapMouseEventService,
	BuildingSelectedEventSubscriber,
	BuildingDeselectedEventSubscriber
} from "../codeMap/codeMap.mouseEvent.service"

export class AttributeSideBarController implements BuildingSelectedEventSubscriber, BuildingDeselectedEventSubscriber {
	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private $mdSidenav: any, private $timeout: ITimeoutService) {
		this.$timeout(() => {
			this.$mdSidenav("right").toggle()
		}, 200)

		CodeMapMouseEventService.subscribeToBuildingSelectedEvents(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingDeselectedEvents(this.$rootScope, this)
	}

	public onBuildingSelected(selectedBuilding: CodeMapBuilding) {}

	public onBuildingDeselected() {}
}

export const attributeSideBarComponent = {
	selector: "attributeSideBarComponent",
	template: require("./attributeSideBar.component.html"),
	controller: AttributeSideBarController
}
