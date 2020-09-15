import { createStore, Store } from "redux"
import rootReducer from "./store/state.reducer"
import { IRootScopeService } from "angular"
import { splitStateActions } from "./store/state.splitter"
import { IsLoadingMapActions, setIsLoadingMap } from "./store/appSettings/isLoadingMap/isLoadingMap.actions"
import { IsLoadingFileActions } from "./store/appSettings/isLoadingFile/isLoadingFile.actions"
import { CCAction, State } from "../codeCharta.model"
import { SearchPanelModeActions } from "./store/appSettings/searchPanelMode/searchPanelMode.actions"
import { isActionOfType } from "../util/reduxHelper"
import { SortingOrderAscendingActions } from "./store/appSettings/sortingOrderAscending/sortingOrderAscending.actions"
import { SortingOptionActions } from "./store/dynamicSettings/sortingOption/sortingOption.actions"
import { IsAttributeSideBarVisibleActions } from "./store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.actions"
import { PanelSelectionActions } from "./store/appSettings/panelSelection/panelSelection.actions"
import { PresentationModeActions } from "./store/appSettings/isPresentationMode/isPresentationMode.actions"

export interface StoreSubscriber {
	onStoreChanged(actionType: string)
}

export interface DispatchOptions {
	silent: boolean
}

export class StoreService {
	private static STORE_CHANGED_EVENT = "store-changed"
	private store: Store

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService) {
		this.store = createStore(rootReducer)
	}

	dispatch(action: CCAction, options: DispatchOptions = { silent: false }) {
		if (
			!(
				isActionOfType(action.type, IsLoadingMapActions) ||
				isActionOfType(action.type, IsLoadingFileActions) ||
				isActionOfType(action.type, SortingOrderAscendingActions) ||
				isActionOfType(action.type, SearchPanelModeActions) ||
				isActionOfType(action.type, SortingOptionActions) ||
				isActionOfType(action.type, IsAttributeSideBarVisibleActions) ||
				isActionOfType(action.type, PanelSelectionActions) ||
				isActionOfType(action.type, PresentationModeActions) ||
				options.silent
			)
		) {
			this.dispatch(setIsLoadingMap(true))
		}

		splitStateActions(action).forEach(atomicAction => {
			this.store.dispatch(atomicAction)
			if (!options.silent) {
				this.notify(atomicAction.type)
			}
		})
	}

	getState(): State {
		return this.store.getState()
	}

	private notify(actionType: string) {
		this.$rootScope.$broadcast(StoreService.STORE_CHANGED_EVENT, { actionType })
	}

	static subscribe($rootScope: IRootScopeService, subscriber: StoreSubscriber) {
		$rootScope.$on(StoreService.STORE_CHANGED_EVENT, (_event_, data) => {
			subscriber.onStoreChanged(data.actionType)
		})
	}
}
