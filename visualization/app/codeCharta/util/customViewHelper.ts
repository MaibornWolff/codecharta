"use strict"
import { LocalStorageCustomViews, RecursivePartial, State } from "../codeCharta.model"
import { CustomViewItemGroup } from "../ui/customViews/customViews.component"
import { CustomViewBuilder } from "./customViewBuilder"
import { CustomView, CustomViewMapSelectionMode } from "../model/customView/customView.api.model"
import { CustomViewFileStateConnector } from "../ui/customViews/customViewFileStateConnector"

export class CustomViewHelper {
	private static readonly CUSTOM_VIEWS_LOCAL_STORAGE_VERSION = "1.0.0"
	private static readonly CUSTOM_VIEWS_LOCAL_STORAGE_ELEMENT = "customViews"

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
					} as CustomViewItemGroup
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
		if (
			customViewFileStateConnector.getJointMapName() === customView.assignedMaps.join(" ") &&
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

	static addCustomView(
		newCustomView: RecursivePartial<CustomView>,
	) {
		this.customViews.set(newCustomView.id, newCustomView)
		this.setCustomViewsToLocalStorage(this.customViews)
	}

	static getCustomViewSettings(viewId: string): RecursivePartial<CustomView> | undefined {
		return this.customViews.get(viewId)
	}

	static hasCustomView(
		mapSelectionMode: CustomViewMapSelectionMode,
		selectedMaps: string[],
		viewName: string
	): boolean {
		const customViewIdentifier = CustomViewBuilder.createCustomViewIdentifier(
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

	static createNewCustomView(viewName: string, state: State): CustomView {
		return CustomViewBuilder.buildFromState(viewName, state)
	}

	static getViewNameSuggestionByFileState(customViewFileStateConnector: CustomViewFileStateConnector): string {
		let suggestedViewName = ""

		if (!customViewFileStateConnector.getJointMapName()) {
			return suggestedViewName
		}

		suggestedViewName = customViewFileStateConnector.getJointMapName()

		const customViewNumberSuffix =
			CustomViewHelper.getCustomViewsAmountByMapAndMode(
				customViewFileStateConnector.getJointMapName(),
				customViewFileStateConnector.getMapSelectionMode()
			) + 1

		return `${suggestedViewName} #${customViewNumberSuffix}`
	}

	static deleteCustomView(viewId: string) {
		this.customViews.delete(viewId)
		this.setCustomViewsToLocalStorage(this.customViews)
	}

	static sortCustomViewDropDownGroupList() {
		return function (a: CustomViewItemGroup, b: CustomViewItemGroup) {
			if (a.hasApplicableItems && !b.hasApplicableItems) {
				return -1
			}

			if (!a.hasApplicableItems && !b.hasApplicableItems) {
				if (a.mapSelectionMode > b.mapSelectionMode) {
					return 1
				}
				if (a.mapSelectionMode < b.mapSelectionMode) {
					return -1
				}
				return 0
			}

			return 1
		}
	}
}
