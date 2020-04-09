import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { IsAttributeSideBarVisibleActions, setIsAttributeSideBarVisible } from "./isAttributeSideBarVisible.actions"
import { isActionOfType } from "../../../../util/reduxHelper"
import { CodeMapBuilding } from "../../../../ui/codeMap/rendering/codeMapBuilding"
import {
	BuildingDeselectedEventSubscriber,
	BuildingSelectedEventSubscriber,
	ThreeSceneService
} from "../../../../ui/codeMap/threeViewer/threeSceneService"

export interface IsAttributeSideBarVisibleSubscriber {
	onIsAttributeSideBarVisibleChanged(isAttributeSideBarVisible: boolean)
}

export class IsAttributeSideBarVisibleService
	implements StoreSubscriber, BuildingSelectedEventSubscriber, BuildingDeselectedEventSubscriber {
	private static IS_ATTRIBUTE_SIDE_BAR_VISIBLE_CHANGED_EVENT = "is-attribute-side-bar-visible-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		ThreeSceneService.subscribeToBuildingSelectedEvents(this.$rootScope, this)
		ThreeSceneService.subscribeToBuildingDeselectedEvents(this.$rootScope, this)
	}

	public onBuildingSelected(selectedBuilding: CodeMapBuilding) {
		this.storeService.dispatch(setIsAttributeSideBarVisible(true))
	}

	public onBuildingDeselected() {
		this.storeService.dispatch(setIsAttributeSideBarVisible(false))
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, IsAttributeSideBarVisibleActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.isAttributeSideBarVisible
	}

	private notify(newState: boolean) {
		this.$rootScope.$broadcast(IsAttributeSideBarVisibleService.IS_ATTRIBUTE_SIDE_BAR_VISIBLE_CHANGED_EVENT, {
			isAttributeSideBarVisible: newState
		})
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: IsAttributeSideBarVisibleSubscriber) {
		$rootScope.$on(IsAttributeSideBarVisibleService.IS_ATTRIBUTE_SIDE_BAR_VISIBLE_CHANGED_EVENT, (event, data) => {
			subscriber.onIsAttributeSideBarVisibleChanged(data.isAttributeSideBarVisible)
		})
	}
}
