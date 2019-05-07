import { IRootScopeService } from "angular"

export interface LoadingGifComponentSubscriber {
	onLoadingFileStatusChanged(isLoadingFile: boolean, event: angular.IAngularEvent)

	onLoadingMapStatusChanged(isLoadingMap: boolean, event: angular.IAngularEvent)
}

export class LoadingGifService {

	public static readonly LOADING_FILE_STATUS_EVENT = "loading-file-status-changed"
	public static readonly LOADING_MAP_STATUS_EVENT = "loading-map-status-changed"

	private isLoadingFile: boolean = true
	private isLoadingMap: boolean = true

	public updateLoadingFileFlag(update: boolean) {
		this.isLoadingFile = update
	}

	public updateLoadingMapFlag(update: boolean) {
		this.isLoadingMap = update
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: LoadingGifComponentSubscriber) {
		$rootScope.$on(LoadingGifService.LOADING_FILE_STATUS_EVENT, (event, data) => {
			subscriber.onLoadingFileStatusChanged(data, event)
		})
		$rootScope.$on(LoadingGifService.LOADING_MAP_STATUS_EVENT, (event, data) => {
			subscriber.onLoadingMapStatusChanged(data, event)
		})
	}
}
