import "./loadingGif.component.scss"
import {IRootScopeService, ITimeoutService} from "angular";

export interface LoadingGifComponentSubscriber {
    onLoadingFileStatusChanged(isLoadingFile: boolean, event: angular.IAngularEvent)
    onLoadingMapStatusChanged(isLoadingMap: boolean, event: angular.IAngularEvent)
}

export class LoadingGifController implements LoadingGifComponentSubscriber{

    public static readonly LOADING_FILE_STATUS_EVENT = "loading-file-status-changed"
    public static readonly LOADING_MAP_STATUS_EVENT = "loading-map-status-changed"

    private _viewModel: {
        isLoadingFile: boolean,
        isLoadingMap: boolean
    } = {
        isLoadingFile: true,
        isLoadingMap: true
    }

    /* @ngInject */
    constructor(
        private $rootScope: IRootScopeService,
        private $timeout: ITimeoutService
    ){
        LoadingGifController.subscribe(this.$rootScope, this)
    }

    public onLoadingFileStatusChanged(isLoadingFile: boolean, event: angular.IAngularEvent) {
        this._viewModel.isLoadingFile = isLoadingFile
        this.synchronizeAngularTwoWayBinding()
    }

    public onLoadingMapStatusChanged(isLoadingMap: boolean, event: angular.IAngularEvent) {
        this._viewModel.isLoadingMap = isLoadingMap
        this.synchronizeAngularTwoWayBinding()
    }

    private synchronizeAngularTwoWayBinding() {
        this.$timeout(() => {})
    }

    public static subscribe($rootScope: IRootScopeService, subscriber: LoadingGifComponentSubscriber) {
        $rootScope.$on(LoadingGifController.LOADING_FILE_STATUS_EVENT, (event, data) => {
            subscriber.onLoadingFileStatusChanged(data, event)
        })
        $rootScope.$on(LoadingGifController.LOADING_MAP_STATUS_EVENT, (event, data) => {
            subscriber.onLoadingMapStatusChanged(data, event)
        })
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

