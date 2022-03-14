import { Component } from "@angular/core"
import "./searchPanel.component.scss"

export type SearchPanelMode = "minimized" | "treeView" | "blacklist"

@Component({
	selector: "cc-search-panel",
	template: require("./searchPanel.component.html")
})
export class SearchPanelComponent {
	searchPanelMode: SearchPanelMode = "minimized"

	constructor() {
		document.addEventListener("mousedown", this.closeSearchPanelOnOutsideClick)
	}

	updateSearchPanelMode = (searchPanelMode: SearchPanelMode) => {
		this.searchPanelMode = this.searchPanelMode === searchPanelMode ? "minimized" : searchPanelMode
	}

	openSearchPanel() {
		this.searchPanelMode = "treeView"
	}

	closeSearchPanelOnOutsideClick = (event: MouseEvent) => {
		if (this.searchPanelMode !== "minimized" && this.isOutside(event)) {
			this.searchPanelMode = "minimized"
		}
	}

	private isOutside(event: MouseEvent) {
		return event
			.composedPath()
			.every(
				element =>
					element["nodeName"] !== "CC-SEARCH-PANEL" &&
					element["nodeName"] !== "COLOR-CHROME" &&
					element["id"] !== "codemap-context-menu"
			)
	}
}
