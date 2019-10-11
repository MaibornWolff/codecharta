import "./codeMap.component.scss"
import { CodeMapBuilding } from "./rendering/codeMapBuilding"
import { ThreeViewerService } from "./threeViewer/threeViewerService"
import { BuildingRightClickedEventSubscriber, CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { IRootScopeService, ITimeoutService } from "angular"
import { NodeContextMenuController } from "../nodeContextMenu/nodeContextMenu.component"
import { LoadingGifComponentSubscriber, LoadingGifService } from "../loadingGif/loadingGif.service"
import { AttributeSideBarService, AttributeSideBarVisibilitySubscriber } from "../attributeSideBar/attributeSideBar.service"

export class CodeMapController
	implements BuildingRightClickedEventSubscriber, LoadingGifComponentSubscriber, AttributeSideBarVisibilitySubscriber {
	private _viewModel: {
		isLoadingFile: boolean
		isSideBarVisible: boolean
	} = {
		isLoadingFile: true,
		isSideBarVisible: null
	}

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private $timeout: ITimeoutService,
		private $element: Element,
		private threeViewerService: ThreeViewerService,
		private codeMapMouseEventService: CodeMapMouseEventService
	) {
		CodeMapMouseEventService.subscribeToBuildingRightClickedEvents(this.$rootScope, this)
		LoadingGifService.subscribe(this.$rootScope, this)
		AttributeSideBarService.subscribe(this.$rootScope, this)
	}

	public $postLink() {
		this.threeViewerService.init(this.$element[0].children[0])
		this.threeViewerService.animate()
		this.codeMapMouseEventService.start()
	}

	public onBuildingRightClicked(building: CodeMapBuilding, x: number, y: number) {
		NodeContextMenuController.broadcastHideEvent(this.$rootScope)
		if (building) {
			const nodeType = building.node.isLeaf ? "File" : "Folder"
			NodeContextMenuController.broadcastShowEvent(this.$rootScope, building.node.path, nodeType, x, y)
		}
	}

	public onAttributeSideBarVisibilityChanged(isAttributeSideBarVisible: boolean) {
		this._viewModel.isSideBarVisible = isAttributeSideBarVisible
	}

	public onLoadingFileStatusChanged(isLoadingFile: boolean) {
		this._viewModel.isLoadingFile = isLoadingFile
		this.synchronizeAngularTwoWayBinding()
	}

	public onLoadingMapStatusChanged(isLoadingMap: boolean) {}

	private synchronizeAngularTwoWayBinding() {
		this.$timeout(() => {})
	}
}

export const codeMapComponent = {
	selector: "codeMapComponent",
	template: require("./codeMap.component.html"),
	controller: CodeMapController
}
