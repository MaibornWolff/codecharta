"use strict"
import {
	CCLocalStorage,
	RecursivePartial, State
} from "../codeCharta.model"
import { CustomViewItem } from "../ui/customViews/customViews.component";
import {CustomViewBuilder} from "./customViewBuilder";
import {CustomView} from "../model/customView/customView.api.model";
import {FileSelectionState} from "../model/files/files";

export class CustomViewHelper {
	private static readonly CC_LOCAL_STORAGE_VERSION = "1.0.0"
    private static readonly CC_LOCAL_STORAGE_ELEMENT_CUSTOM_VIEWS = 'customViews'

	private static customViews: Map<string, RecursivePartial<CustomView>> = CustomViewHelper.loadCustomViews()

	static getCustomViewItems(currentMapName = "") {
		const customViewItems: CustomViewItem[] = []

		this.customViews.forEach(customView => {
			customViewItems.push({
				name: customView.name,
				mapName: customView.mapName,
                isApplicable: this.isCustomViewApplicable(currentMapName, customView.mapName)
			})
		})
		return customViewItems
	}

	private static isCustomViewApplicable(currentMapName: string, customViewMapName: string) {
		if (currentMapName.length > 0) {
			return customViewMapName === currentMapName
		}

		return true
	}

	private static setCustomViewsToLocalStorage(customViews: Map<string, RecursivePartial<CustomView>>) {
		const newLocalStorageElement: CCLocalStorage = {
			version: this.CC_LOCAL_STORAGE_VERSION,
			scenarios: [],
			customViews: [...customViews]
		}
		localStorage.setItem(this.CC_LOCAL_STORAGE_ELEMENT_CUSTOM_VIEWS, JSON.stringify(newLocalStorageElement))
	}

	private static loadCustomViews() {
		const ccLocalStorage: CCLocalStorage = JSON.parse(localStorage.getItem(this.CC_LOCAL_STORAGE_ELEMENT_CUSTOM_VIEWS))
		if (ccLocalStorage?.customViews) {
			return new Map(ccLocalStorage.customViews)
		}
		return new Map()
	}

	static addCustomView(newCustomView: RecursivePartial<CustomView>) {
		this.customViews.set(newCustomView.name, newCustomView)
		this.setCustomViewsToLocalStorage(this.customViews)
	}

	static getCustomViewSettings(viewName: string): RecursivePartial<CustomView>|undefined {
		return this.customViews.get(viewName)
	}

	static hasCustomView(viewName: string): boolean {
		return this.customViews.has(viewName)
	}

	static getCustomViewsAmountByMap(mapName: string): number {
		let count = 0
		
		this.customViews.forEach( view => {
			if (view.mapName === mapName) {
				count++
			}
		})

		return count
	}

	static createNewCustomView(viewName: string, state: State): CustomView {
		return CustomViewBuilder.buildFromState(viewName, state)
	}

	static getViewNameSuggestion(state: State): string {
		let suggestedViewName = ""

		if (!state.files) {
			return suggestedViewName
		}

		const selectedFile = state.files.find(
			fileItem => fileItem.selectedAs === FileSelectionState.Single
		)
		if (!selectedFile) {
			return suggestedViewName
		}

		const selectedMapFile = selectedFile.file

		if (!selectedMapFile || !selectedMapFile.fileMeta.fileName) {
			return suggestedViewName
		}

		const mapName = selectedMapFile.fileMeta.fileName
		suggestedViewName = mapName

		const ccJsonExtensionIndex = suggestedViewName.indexOf(".cc.json")
		if (ccJsonExtensionIndex >= 0) {
			suggestedViewName = suggestedViewName.slice(0, ccJsonExtensionIndex)
		}

		return `${suggestedViewName} #${CustomViewHelper.getCustomViewsAmountByMap(mapName) + 1}`
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
				} else if (a.name < b.name) {
					return -1
				}
				return 0
			}
			if (a.isApplicable && !b.isApplicable) {
				return -1
			}
			return 1
		};
	}
}
