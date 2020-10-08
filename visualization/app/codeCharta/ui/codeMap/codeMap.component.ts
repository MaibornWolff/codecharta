import "./codeMap.component.scss"
import { ThreeViewerService } from "./threeViewer/threeViewerService"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { IRootScopeService, ITimeoutService } from "angular"
import { IsLoadingFileService, IsLoadingFileSubscriber } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.service"
import {
	IsAttributeSideBarVisibleService,
	IsAttributeSideBarVisibleSubscriber
} from "../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.service"
import { CodeChartaMouseEventService } from "../../codeCharta.mouseEvent.service"

export class CodeMapController implements IsAttributeSideBarVisibleSubscriber, IsLoadingFileSubscriber {
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
		private codeMapMouseEventService: CodeMapMouseEventService,
		private codeChartaMouseEventService: CodeChartaMouseEventService
	) {
		IsAttributeSideBarVisibleService.subscribe(this.$rootScope, this)
		IsLoadingFileService.subscribe(this.$rootScope, this)
	}

	$postLink() {
		this.threeViewerService.init(this.$element[0].children[0])
		this.threeViewerService.animate()
		this.codeMapMouseEventService.start()
	}

	onIsAttributeSideBarVisibleChanged(isAttributeSideBarVisible: boolean) {
		this._viewModel.isSideBarVisible = isAttributeSideBarVisible
	}

	onIsLoadingFileChanged(isLoadingFile: boolean) {
		this._viewModel.isLoadingFile = isLoadingFile
		this.synchronizeAngularTwoWayBinding()
	}

	onClick() {
		this.codeChartaMouseEventService.closeComponentsExceptCurrent()
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
