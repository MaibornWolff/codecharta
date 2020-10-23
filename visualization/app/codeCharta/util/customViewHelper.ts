"use strict"
import { LocalStorageCustomViews, RecursivePartial, State } from "../codeCharta.model"
import { CustomViewItem } from "../ui/customViews/customViews.component"
import { CustomViewBuilder } from "./customViewBuilder"
import { CustomView, CustomViewMapSelectionMode } from "../model/customView/customView.api.model"
import { CustomViewFileStateConnector } from "../ui/customViews/customViewFileStateConnector"

export class CustomViewHelper {
	private static readonly CUSTOM_VIEWS_LOCAL_STORAGE_VERSION = "1.0.0"
	private static readonly CUSTOM_VIEWS_LOCAL_STORAGE_ELEMENT = "customViews"

	private static customViews: Map<string, RecursivePartial<CustomView>> = CustomViewHelper.loadCustomViews()

	static getCustomViewItems(customViewFileStateConnector: CustomViewFileStateConnector): CustomViewItem[] {
		const customViewItems: CustomViewItem[] = []

		this.customViews.forEach(customView => {
			customViewItems.push({
				name: customView.name,
				mapName: customView.assignedMap,
				mapSelectionMode: customView.mapSelectionMode,
				isApplicable: this.isCustomViewApplicable(customViewFileStateConnector, customView)
			})
		})

		return customViewItems
	}

	private static isCustomViewApplicable(
		customViewFileStateConnector: CustomViewFileStateConnector,
		customView: RecursivePartial<CustomView>
	) {
		if (
			customViewFileStateConnector.getJointMapName() === customView.assignedMap &&
			customViewFileStateConnector.getChecksumOfAssignedMaps() === customView.mapChecksum &&
			customViewFileStateConnector.getMapSelectionMode() === customView.mapSelectionMode
		) {
			return true
		}

		return false
	}

	private static setCustomViewsToLocalStorage(customViews: Map<string, RecursivePartial<CustomView>>) {
		const newLocalStorageElement: LocalStorageCustomViews = {
			version: this.CUSTOM_VIEWS_LOCAL_STORAGE_VERSION,
			customViews: [...customViews]
		}
		localStorage.setItem(this.CUSTOM_VIEWS_LOCAL_STORAGE_ELEMENT, JSON.stringify(newLocalStorageElement))
	}

	private static loadCustomViews() {
		const ccLocalStorage: LocalStorageCustomViews = JSON.parse(localStorage.getItem(this.CUSTOM_VIEWS_LOCAL_STORAGE_ELEMENT))
		if (ccLocalStorage?.customViews) {
			return new Map(ccLocalStorage.customViews)
		}
		return new Map()
	}

	static addCustomView(newCustomView: RecursivePartial<CustomView>) {
		this.customViews.set(newCustomView.name, newCustomView)
		this.setCustomViewsToLocalStorage(this.customViews)
	}

	static getCustomViewSettings(viewName: string): RecursivePartial<CustomView> | undefined {
		return this.customViews.get(viewName)
	}

	static hasCustomView(viewName: string): boolean {
		return this.customViews.has(viewName)
	}

	static getCustomViewsAmountByMapAndMode(mapName: string, mapSelectionMode: CustomViewMapSelectionMode): number {
		let count = 0

		this.customViews.forEach(view => {
			if (view.assignedMap === mapName && view.mapSelectionMode === mapSelectionMode) {
				count++
			}
		})

		return count
	}

	static createNewCustomView(viewName: string, state: State): CustomView {
		return CustomViewBuilder.buildFromState(viewName, state)
	}

	static getViewNameSuggestionByFileState(customViewFileStateConnector: CustomViewFileStateConnector): string {
		let suggestedViewName = ""

		if (!customViewFileStateConnector.getJointMapName()) {
			return suggestedViewName
		}

		suggestedViewName = customViewFileStateConnector.getJointMapName()

		if (!customViewFileStateConnector.isMapSelectionModeSingle()) {
			const mapSelectionMode = customViewFileStateConnector.isMapSelectionModeDelta() ? "delta" : "multiple"
			suggestedViewName += ` (${mapSelectionMode})`
		}

		const customViewNumberSuffix =
			CustomViewHelper.getCustomViewsAmountByMapAndMode(
				customViewFileStateConnector.getJointMapName(),
				customViewFileStateConnector.getMapSelectionMode()
			) + 1

		// Example suggestion: yourMapName (delta) #3
		return `${suggestedViewName} #${customViewNumberSuffix}`
	}

	static deleteCustomView(viewName: string) {
		this.customViews.delete(viewName)
		this.setCustomViewsToLocalStorage(this.customViews)
	}

	static sortCustomViewDropDownList() {
		return function (a: CustomViewItem, b: CustomViewItem) {
			if (a.isApplicable && b.isApplicable) {
				if (a.name > b.name) {
					return 1
				}
				if (a.name < b.name) {
					return -1
				}
				return 0
			}
			if (a.isApplicable && !b.isApplicable) {
				return -1
			}
			return 1
		}
	}
}
