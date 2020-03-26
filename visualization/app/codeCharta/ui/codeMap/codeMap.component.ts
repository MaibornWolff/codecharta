import "./codeMap.component.scss"
import { ThreeViewerService } from "./threeViewer/threeViewerService"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { IRootScopeService, ITimeoutService } from "angular"
import { AttributeSideBarService, AttributeSideBarVisibilitySubscriber } from "../attributeSideBar/attributeSideBar.service"
import { IsLoadingFileService, IsLoadingFileSubscriber } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.service"

export class CodeMapController implements AttributeSideBarVisibilitySubscriber, IsLoadingFileSubscriber {
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
		AttributeSideBarService.subscribe(this.$rootScope, this)
		IsLoadingFileService.subscribe(this.$rootScope, this)
	}

	public $postLink() {
		this.threeViewerService.init(this.$element[0].children[0])
		this.threeViewerService.animate()
		this.codeMapMouseEventService.start()
	}

	public onAttributeSideBarVisibilityChanged(isAttributeSideBarVisible: boolean) {
		this._viewModel.isSideBarVisible = isAttributeSideBarVisible
	}

	public onIsLoadingFileChanged(isLoadingFile: boolean) {
		this._viewModel.isLoadingFile = isLoadingFile
		this.synchronizeAngularTwoWayBinding()
	}

	private synchronizeAngularTwoWayBinding() {
		this.$timeout(() => {})
	}
}

export const codeMapComponent = {
	selector: "codeMapComponent",
	template: require("./codeMap.component.html"),
	controller: CodeMapController
}
