"use strict"
import { LocalStorageCustomViews, RecursivePartial } from "../codeCharta.model"
import { CustomViewItemGroup } from "../ui/customViews/customViews.component"
import { CustomView, CustomViewMapSelectionMode } from "../model/customView/customView.api.model"
import { CustomViewFileStateConnector } from "../ui/customViews/customViewFileStateConnector"
import {createCustomViewIdentifier} from "./customViewBuilder";

export class CustomViewHelper {
	private static readonly CUSTOM_VIEWS_LOCAL_STORAGE_VERSION = "1.0.0"
	private static readonly CUSTOM_VIEWS_LOCAL_STORAGE_ELEMENT = "CodeCharta::customViews"

	private static customViews: Map<string, RecursivePartial<CustomView>> = CustomViewHelper.loadCustomViews()

	static getCustomViewItemGroups(customViewFileStateConnector: CustomViewFileStateConnector): Map<string, CustomViewItemGroup> {
		const customViewItemGroups: Map<string, CustomViewItemGroup> = new Map()

		this.customViews.forEach(customView => {
			const groupKey = `${customView.assignedMaps.join("_")  }_${  customView.mapSelectionMode}`

			if (!customViewItemGroups.has(groupKey)) {
				customViewItemGroups.set(
					groupKey,
					{
						mapNames: customView.assignedMaps.join(" "),
						mapSelectionMode: customView.mapSelectionMode,
						hasApplicableItems: false,
						customViewItems: []
					}
				)
			}

			const customViewItemApplicable = this.isCustomViewApplicable(customViewFileStateConnector, customView)
			customViewItemGroups.get(groupKey).customViewItems.push({
				id: customView.id,
				name: customView.name,
				mapNames: customView.assignedMaps.join(" "),
				mapSelectionMode: customView.mapSelectionMode,
				isApplicable: customViewItemApplicable
			})

			if (customViewItemApplicable) {
				customViewItemGroups.get(groupKey).hasApplicableItems = true
			}
		})

		return customViewItemGroups
	}

	private static isCustomViewApplicable(
		customViewFileStateConnector: CustomViewFileStateConnector,
		customView: RecursivePartial<CustomView>
	) {
		// TODO: Follow Up: Configs are applicable if their checksums are matching, but map names should not be checked.
		return customViewFileStateConnector.getJointMapName() === customView.assignedMaps.join(" ") &&
			customViewFileStateConnector.getChecksumOfAssignedMaps() === customView.mapChecksum &&
			customViewFileStateConnector.getMapSelectionMode() === customView.mapSelectionMode;
	}

	private static setCustomViewsToLocalStorage() {
		const newLocalStorageElement: LocalStorageCustomViews = {
			version: this.CUSTOM_VIEWS_LOCAL_STORAGE_VERSION,
			customViews: [...this.customViews]
		}
		localStorage.setItem(this.CUSTOM_VIEWS_LOCAL_STORAGE_ELEMENT, JSON.stringify(newLocalStorageElement))
	}

	private static loadCustomViews() {
		const ccLocalStorage: LocalStorageCustomViews = JSON.parse(localStorage.getItem(this.CUSTOM_VIEWS_LOCAL_STORAGE_ELEMENT))
		return new Map(ccLocalStorage?.customViews)
	}

	static addCustomView(
		newCustomView: RecursivePartial<CustomView>,
	) {
		this.customViews.set(newCustomView.id, newCustomView)
		this.setCustomViewsToLocalStorage()
	}

	static getCustomViewSettings(viewId: string): RecursivePartial<CustomView> | undefined {
		return this.customViews.get(viewId)
	}

	static hasCustomView(
		mapSelectionMode: CustomViewMapSelectionMode,
		selectedMaps: string[],
		viewName: string
	): boolean {
		const customViewIdentifier = createCustomViewIdentifier(
			mapSelectionMode,
			selectedMaps,
			viewName
		)

		return this.customViews.has(customViewIdentifier)
	}

	static getCustomViewsAmountByMapAndMode(mapNames: string, mapSelectionMode: CustomViewMapSelectionMode): number {
		let count = 0

		this.customViews.forEach(view => {
			if (view.assignedMaps.join(" ") === mapNames && view.mapSelectionMode === mapSelectionMode) {
				count++
			}
		})

		return count
	}

	static getViewNameSuggestionByFileState(customViewFileStateConnector: CustomViewFileStateConnector): string {
		const suggestedViewName = customViewFileStateConnector.getJointMapName()
		
		if (!suggestedViewName) {
			return ""
		}

		const customViewNumberSuffix =
			CustomViewHelper.getCustomViewsAmountByMapAndMode(
				customViewFileStateConnector.getJointMapName(),
				customViewFileStateConnector.getMapSelectionMode()
			) + 1

		return `${suggestedViewName} #${customViewNumberSuffix}`
	}

	static deleteCustomView(viewId: string) {
		this.customViews.delete(viewId)
		this.setCustomViewsToLocalStorage()
	}

	static sortCustomViewDropDownGroupList(a: CustomViewItemGroup, b: CustomViewItemGroup) {
		if (!b.hasApplicableItems) {
			if (a.hasApplicableItems || a.mapSelectionMode < b.mapSelectionMode) {
				return -1
			}
			if (a.mapSelectionMode === b.mapSelectionMode) {
				return 0
			}
		}

		return 1
	}
}
