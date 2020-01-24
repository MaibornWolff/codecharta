import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { ResetCameraIfNewFileIsLoadedActions } from "./resetCameraIfNewFileIsLoaded.actions"
import _ from "lodash"

export interface ResetCameraIfNewFileIsLoadedSubscriber {
	onResetCameraIfNewFileIsLoadedChanged(resetCameraIfNewFileIsLoaded: boolean)
}

export class ResetCameraIfNewFileIsLoadedService implements StoreSubscriber {
	private static RESET_CAMERA_IF_NEW_FILE_IS_LOADED_CHANGED_EVENT = "reset-camera-if-new-file-is-loaded-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(ResetCameraIfNewFileIsLoadedActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.resetCameraIfNewFileIsLoaded
	}

	private notify(newState: boolean) {
		this.$rootScope.$broadcast(ResetCameraIfNewFileIsLoadedService.RESET_CAMERA_IF_NEW_FILE_IS_LOADED_CHANGED_EVENT, {
			resetCameraIfNewFileIsLoaded: newState
		})
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: ResetCameraIfNewFileIsLoadedSubscriber) {
		$rootScope.$on(ResetCameraIfNewFileIsLoadedService.RESET_CAMERA_IF_NEW_FILE_IS_LOADED_CHANGED_EVENT, (event, data) => {
			subscriber.onResetCameraIfNewFileIsLoadedChanged(data.resetCameraIfNewFileIsLoaded)
		})
	}
}
