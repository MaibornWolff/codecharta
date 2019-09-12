import { IRootScopeService } from "angular"

export interface AttributeSideBarVisibilitySubscriber {
	onAttributeSideBarVisibilityChanged(isAttributeSideBarVisible: boolean)
}

export class AttributeSideBarService {
	public static readonly ATTRIBUTE_SIDE_BAR_VISIBILITY_CHANGED_EVENT = "attribute-side-bar-visibility-changed-event"

	private isAttributeSideBarVisible: boolean = false

	constructor(private $rootScope: IRootScopeService) {}

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
