import "./loadingGif.component.scss"
import { IRootScopeService, ITimeoutService } from "angular"
import { IsLoadingFileService, IsLoadingFileSubscriber } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.service"
import { IsLoadingMapService, IsLoadingMapSubscriber } from "../../state/store/appSettings/isLoadingMap/isLoadingMap.service"

export class LoadingGifController implements IsLoadingFileSubscriber, IsLoadingMapSubscriber {
	private _viewModel: {
		isLoadingFile: boolean
		isLoadingMap: boolean
	} = {
		isLoadingFile: true,
		isLoadingMap: true
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private $timeout: ITimeoutService) {
		IsLoadingFileService.subscribe(this.$rootScope, this)
		IsLoadingMapService.subscribe(this.$rootScope, this)
	}

	public onIsLoadingFileChanged(isLoadingFile: boolean) {
		this._viewModel.isLoadingFile = isLoadingFile
		this.synchronizeAngularTwoWayBinding()
	}

	public onIsLoadingMapChanged(isLoadingMap: boolean) {
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
