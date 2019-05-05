import "./loadingGif.component.scss"
import {IRootScopeService, ITimeoutService} from "angular";

export interface LoadingGifComponentSubscriber {
    onLoadingStatusChanged(isLoadingFile: boolean, event: angular.IAngularEvent)
}

export class LoadingGifController {

    public static readonly LOADING_STATUS_EVENT = "loading-status-changed"

    private _viewModel: {
        isLoadingFile: boolean,
    } = {
        isLoadingFile: true,
    }

    /* @ngInject */
    constructor(
        private $rootScope: IRootScopeService,
        private $timeout: ITimeoutService
    ){
        LoadingGifController.subscribe(this.$rootScope, this)
    }

    public onLoadingStatusChanged(isLoadingFile: boolean, event: angular.IAngularEvent) {
        this._viewModel.isLoadingFile = isLoadingFile
        this.synchronizeAngularTwoWayBinding()
    }

    private synchronizeAngularTwoWayBinding() {
        this.$timeout(() => {})
    }

    public static subscribe($rootScope: IRootScopeService, subscriber: LoadingGifComponentSubscriber) {
        $rootScope.$on(LoadingGifController.LOADING_STATUS_EVENT, (event, data) => {
            subscriber.onLoadingStatusChanged(data, event)
        })
    }
}

export const loadingGifComponent = {
    selector: "loadingGifComponent",
    template: require("./loadingGif.component.html"),
    controller: LoadingGifController
}

