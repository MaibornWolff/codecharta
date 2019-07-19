import "./loadingGif.component.scss"
import { IRootScopeService, ITimeoutService } from "angular"
import { LoadingGifComponentSubscriber, LoadingGifService } from "./loadingGif.service"

export class LoadingGifController implements LoadingGifComponentSubscriber {
	private _viewModel: {
		isLoadingFile: boolean
		isLoadingMap: boolean
	} = {
		isLoadingFile: true,
		isLoadingMap: true
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private $timeout: ITimeoutService) {
		LoadingGifService.subscribe(this.$rootScope, this)
	}

	public onLoadingFileStatusChanged(isLoadingFile: boolean) {
		this._viewModel.isLoadingFile = isLoadingFile
		this.synchronizeAngularTwoWayBinding()
	}

	public onLoadingMapStatusChanged(isLoadingMap: boolean) {
		this._viewModel.isLoadingMap = isLoadingMap
		this.synchronizeAngularTwoWayBinding()
	}

	private synchronizeAngularTwoWayBinding() {
		this.$timeout(() => {})
	}
}

export const loadingGifFileComponent = {
	selector: "loadingGifFileComponent",
	template: require("./loadingGif.file.component.html"),
	controller: LoadingGifController
}

export const loadingGifMapComponent = {
	selector: "loadingGifMapComponent",
	template: require("./loadingGif.map.component.html"),
	controller: LoadingGifController
}
