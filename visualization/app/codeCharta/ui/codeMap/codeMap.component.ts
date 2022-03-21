import "./codeMap.component.scss"
import { ThreeViewerService } from "./threeViewer/threeViewerService"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { IRootScopeService } from "angular"
import { IsLoadingFileService, IsLoadingFileSubscriber } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.service"
import {
	IsAttributeSideBarVisibleService,
	IsAttributeSideBarVisibleSubscriber
} from "../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.service"
import { SharpnessModeService, SharpnessModeSubscriber } from "../../state/store/appSettings/sharpnessMode/sharpnessMode.service"
export class CodeMapController implements IsAttributeSideBarVisibleSubscriber, IsLoadingFileSubscriber, SharpnessModeSubscriber {
	private _viewModel: {
		isLoadingFile: boolean
		isSideBarVisible: boolean
	} = {
		isLoadingFile: true,
		isSideBarVisible: null
	}

	constructor(
		private $rootScope: IRootScopeService,
		private $element: Element,
		private threeViewerService: ThreeViewerService,
		private codeMapMouseEventService: CodeMapMouseEventService
	) {
		"ngInject"
		IsAttributeSideBarVisibleService.subscribe(this.$rootScope, this)
		IsLoadingFileService.subscribe(this.$rootScope, this)
		SharpnessModeService.subscribe(this.$rootScope, this)
	}

	$postLink() {
		this.threeViewerService.init(this.$element[0].children[0])
		this.codeMapMouseEventService.start()
	}

	onIsAttributeSideBarVisibleChanged(isAttributeSideBarVisible: boolean) {
		this._viewModel.isSideBarVisible = isAttributeSideBarVisible
	}

	onIsLoadingFileChanged(isLoadingFile: boolean) {
		this.threeViewerService?.dispose()
		this._viewModel.isLoadingFile = isLoadingFile
	}

	// TODO not used right now, but added for catching the gl context loss, needs to be further implemented and tested
	catchContextLoss() {
		const canvas = this.threeViewerService.getRenderCanvas()
		const extention = this.threeViewerService.getRenderLoseExtention()
		canvas.addEventListener(
			"webglcontextlost",
			() => {
				extention.restoreContext()
			},
			false
		)
		canvas.addEventListener("webglcontextrestored", () => {})
	}

	onSharpnessModeChanged() {
		this.threeViewerService.stopAnimate()
		this.threeViewerService.destroy()
		this.$postLink()
		this.threeViewerService.autoFitTo()
		this.threeViewerService.animate()
		this.threeViewerService.animateStats()
	}
}

export const codeMapComponent = {
	selector: "codeMapComponent",
	template: require("./codeMap.component.html"),
	controller: CodeMapController
}
