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
import { SharpnessModeService, SharpnessSubscriber } from "../../state/store/appSettings/sharpness/sharpness.service"
import { StoreService } from "../../state/store.service"
import { SharpnessMode } from "../../codeCharta.model"

export class CodeMapController implements IsAttributeSideBarVisibleSubscriber, IsLoadingFileSubscriber,SharpnessSubscriber {
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
		private codeChartaMouseEventService: CodeChartaMouseEventService,
		private storeService: StoreService
	) {
		IsAttributeSideBarVisibleService.subscribe(this.$rootScope, this)
		IsLoadingFileService.subscribe(this.$rootScope, this)
		SharpnessModeService.subscribe(this.$rootScope, this)
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

	catchContextLoss = () => {
		const canvas = this.threeViewerService.getRenderer().domElement
		const gl = this.threeViewerService.getRenderer().getContext()
		const extention = gl.getExtension("WEBGL_lose_context")
		canvas.addEventListener('webglcontextlost', () => {
			// eslint-disable-next-line no-console
			console.log("context lost")
			extention.restoreContext()
		}, false);
		canvas.addEventListener("webglcontextrestored", () => {
			// eslint-disable-next-line no-console
			console.log("context restored")
		})
	}

	stopGlContext = () => {
		const gl = this.threeViewerService.getRenderer().getContext()
		const extention = gl.getExtension("WEBGL_lose_context")
		extention.loseContext()
	}

	onSharpnessModeChanged() {
		const state = this.storeService.getState()
		const { appSettings: { sharpnessMode } } = state
		
		const canvas = this.threeViewerService.getRenderer().domElement;

		switch (sharpnessMode) {
			case SharpnessMode.PixelRatioNoAA:
				canvas.remove()
				this.stopGlContext()
				this.threeViewerService.getRenderer().dispose()
				this.$postLink()
				
				break;
		}
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
