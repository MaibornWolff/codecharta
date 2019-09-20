import { IRootScopeService } from "angular"

export interface LoadingGifComponentSubscriber {
	onLoadingFileStatusChanged(isLoadingFile: boolean)

	onLoadingMapStatusChanged(isLoadingMap: boolean)
}

export class LoadingGifService {
	public static readonly LOADING_FILE_STATUS_EVENT = "loading-file-status-changed"
	public static readonly LOADING_MAP_STATUS_EVENT = "loading-map-status-changed"

	private isLoadingFile: boolean = true
	private isLoadingMap: boolean = true

	constructor(private $rootScope: IRootScopeService) {}

	public updateLoadingFileFlag(isLoadingFile: boolean) {
		this.isLoadingFile = isLoadingFile
		this.notifyLoadingFileFlagChange()
	}

	public updateLoadingMapFlag(isLoadingMap: boolean) {
		this.isLoadingMap = isLoadingMap
		this.notifyLoadingMapFlagChange()
	}

	private notifyLoadingFileFlagChange() {
		this.$rootScope.$broadcast(LoadingGifService.LOADING_FILE_STATUS_EVENT, this.isLoadingFile)
	}

	private notifyLoadingMapFlagChange() {
		this.$rootScope.$broadcast(LoadingGifService.LOADING_MAP_STATUS_EVENT, this.isLoadingMap)
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: LoadingGifComponentSubscriber) {
		$rootScope.$on(LoadingGifService.LOADING_FILE_STATUS_EVENT, (event, data) => {
			subscriber.onLoadingFileStatusChanged(data)
		})
		$rootScope.$on(LoadingGifService.LOADING_MAP_STATUS_EVENT, (event, data) => {
			subscriber.onLoadingMapStatusChanged(data)
		})
	}
}
