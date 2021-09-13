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
import { ExperimentalFeaturesEnabledActions } from "./store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { Store } from "./store/store"
import { ScreenshotToClipboardEnabledActions } from "./store/appSettings/enableClipboard/screenshotToClipboardEnabled.actions"

export interface StoreSubscriber {
	onStoreChanged(actionType: string)
}

export interface StoreExtendedSubscriber {
	onStoreChangedExtended(actionType: string, data?: unknown)
}

export interface DispatchOptions {
	silent: boolean
}

export class StoreService {
	static STORE_CHANGED_EVENT = "store-changed"
	private static STORE_CHANGED_EXTENDED_EVENT = "store-changed-extended"
	private store = Store.store
	private originalDispatch: typeof Store.store.dispatch

	constructor(private $rootScope: IRootScopeService) {
		"ngInject"
		// See issue #2292:
		// Temporarily monkey patch so that store changes triggered by directly to store connected Angular's components
		// also notify $rootScope and keep existing logic. After full migration to Angular,
		// we still need to migrate the custom logic of `this.dispatch`. We could keep it through
		// adding a custom middleware, or moving to a thunk middleware.
		this.originalDispatch = Store.store.dispatch
		// @ts-ignore
		Store.store.dispatch = this.dispatch.bind(this)
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
				isActionOfType(action.type, ExperimentalFeaturesEnabledActions) ||
				isActionOfType(action.type, ScreenshotToClipboardEnabledActions) ||
				options.silent
			)
		) {
			this.dispatch(setIsLoadingMap(true))
		}

		for (const atomicAction of splitStateActions(action)) {
			this.originalDispatch(atomicAction)
			if (!options.silent) {
				this.notify(atomicAction.type)
				this.notifyExtended(atomicAction.type, atomicAction.payload)
			}
		}
	}

	getState(): State {
		return this.store.getState()
	}

	private notify(actionType: string) {
		this.$rootScope.$broadcast(StoreService.STORE_CHANGED_EVENT, { actionType })
	}

	private notifyExtended(actionType: string, payload?: unknown) {
		this.$rootScope.$broadcast(StoreService.STORE_CHANGED_EXTENDED_EVENT, { actionType, payload })
	}

	static subscribe($rootScope: IRootScopeService, subscriber: StoreSubscriber) {
		$rootScope.$on(StoreService.STORE_CHANGED_EVENT, (_event_, data) => {
			subscriber.onStoreChanged(data.actionType)
		})
	}

	static subscribeDetailedData($rootScope: IRootScopeService, subscriber: StoreExtendedSubscriber) {
		$rootScope.$on(StoreService.STORE_CHANGED_EXTENDED_EVENT, (_event_, data) => {
			subscriber.onStoreChangedExtended(data.actionType, data.payload)
		})
	}
}
