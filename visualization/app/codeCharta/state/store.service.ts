import { createStore, Store } from "redux"
import rootReducer from "./store/reducer"
import { IRootScopeService } from "angular"
import { splitStateActions } from "./store/state.splitter"
import { IsLoadingMapActions, setIsLoadingMap } from "./store/appSettings/isLoadingMap/isLoadingMap.actions"
import { IsLoadingFileActions } from "./store/appSettings/isLoadingFile/isLoadingFile.actions"
import { CCAction, State } from "../codeCharta.model"
import { isActionOfType } from "../util/reduxHelper"

export interface StoreSubscriber {
	onStoreChanged(actionType: string)
}

export class StoreService {
	private static STORE_CHANGED_EVENT = "store-changed"
	private store: Store

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService) {
		this.store = createStore(rootReducer)
	}

	public dispatch(action: CCAction, isSilent: boolean = false) {
		if (!(isActionOfType(action.type, IsLoadingMapActions) || isActionOfType(action.type, IsLoadingFileActions) || isSilent)) {
			this.dispatch(setIsLoadingMap(true))
		}

		splitStateActions(action).forEach(atomicAction => {
			this.store.dispatch(atomicAction)
			if (!isSilent) {
				this.notify(atomicAction.type)
			}
		})
	}

	public getState(): State {
		return this.store.getState()
	}

	private notify(actionType: string) {
		this.$rootScope.$broadcast(StoreService.STORE_CHANGED_EVENT, { actionType: actionType })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: StoreSubscriber) {
		$rootScope.$on(StoreService.STORE_CHANGED_EVENT, (event, data) => {
			subscriber.onStoreChanged(data.actionType)
		})
	}
}
