import { IRootScopeService } from "angular"
import {
	CodeMapMouseEventService,
	BuildingSelectedEventSubscriber,
	BuildingDeselectedEventSubscriber
} from "../codeMap/codeMap.mouseEvent.service"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"

export interface AttributeSideBarVisibilitySubscriber {
	onAttributeSideBarVisibilityChanged(isAttributeSideBarVisible: boolean)
}

export class AttributeSideBarService implements BuildingSelectedEventSubscriber, BuildingDeselectedEventSubscriber {
	public static readonly ATTRIBUTE_SIDE_BAR_VISIBILITY_CHANGED_EVENT = "attribute-side-bar-visibility-changed-event"

	private isAttributeSideBarVisible: boolean = false

	constructor(private $rootScope: IRootScopeService) {
		CodeMapMouseEventService.subscribeToBuildingSelectedEvents(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingDeselectedEvents(this.$rootScope, this)
	}

	public onBuildingSelected(selectedBuilding: CodeMapBuilding) {
		this.openSideBar()
	}

	public onBuildingDeselected() {
		this.closeSideBar()
	}

	public openSideBar() {
		this.isAttributeSideBarVisible = true
		this.notify()
	}

	public closeSideBar() {
		this.isAttributeSideBarVisible = false
		this.notify()
	}

	private notify() {
		this.$rootScope.$broadcast(AttributeSideBarService.ATTRIBUTE_SIDE_BAR_VISIBILITY_CHANGED_EVENT, this.isAttributeSideBarVisible)
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: AttributeSideBarVisibilitySubscriber) {
		$rootScope.$on(AttributeSideBarService.ATTRIBUTE_SIDE_BAR_VISIBILITY_CHANGED_EVENT, (event, data) => {
			subscriber.onAttributeSideBarVisibilityChanged(data)
		})
	}
}
