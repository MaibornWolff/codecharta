import { Component, ViewEncapsulation } from "@angular/core"

export type SearchPanelMode = "minimized" | "treeView" | "blacklist"

@Component({
	selector: "cc-search-panel",
	templateUrl: "./searchPanel.component.html",
	styleUrls: ["./searchPanel.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class SearchPanelComponent {
	searchPanelMode: SearchPanelMode = "minimized"

	updateSearchPanelMode = (searchPanelMode: SearchPanelMode) => {
		this.setSearchPanelMode(this.searchPanelMode === searchPanelMode ? "minimized" : searchPanelMode)
	}

	openSearchPanel() {
		this.setSearchPanelMode("treeView")
	}

	private closeSearchPanelOnOutsideClick = (event: MouseEvent) => {
		if (this.isOutside(event)) {
			this.setSearchPanelMode("minimized")
		}
	}

	private setSearchPanelMode(newMode: SearchPanelMode) {
		if (this.searchPanelMode === "minimized" && newMode !== "minimized") {
			document.addEventListener("mousedown", this.closeSearchPanelOnOutsideClick)
		}
		if (this.searchPanelMode !== "minimized" && newMode === "minimized") {
			document.removeEventListener("mousedown", this.closeSearchPanelOnOutsideClick)
		}
		this.searchPanelMode = newMode
	}

	private isOutside(event: MouseEvent) {
		return event
			.composedPath()
			.every(
				element =>
					element["nodeName"] !== "CC-SEARCH-PANEL" &&
					element["nodeName"] !== "COLOR-CHROME" &&
					element["nodeName"] !== "MAT-OPTION" &&
					element["id"] !== "codemap-context-menu"
			)
	}
}
