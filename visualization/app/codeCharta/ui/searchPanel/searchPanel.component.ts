import { Component, OnInit, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "app/codeCharta/codeCharta.model"
import { isFileExplorerPinnedSelector } from "app/codeCharta/state/store/appSettings/isFileExplorerPinned/isFileExplorerPinned.selector"
import { Subscription } from "rxjs"

export type SearchPanelMode = "minimized" | "treeView" | "blacklist"

@Component({
	selector: "cc-search-panel",
	templateUrl: "./searchPanel.component.html",
	styleUrls: ["./searchPanel.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class SearchPanelComponent implements OnInit {
	searchPanelMode: SearchPanelMode = "minimized"
	isFileExplorerPinned: boolean
	isFileExplorerPinnedSubscription: Subscription

	constructor(private store: Store<CcState>) {}

	ngOnInit(): void {
		this.isFileExplorerPinnedSubscription = this.store.select(isFileExplorerPinnedSelector).subscribe(isFileExplorerPinned => {
			this.isFileExplorerPinned = isFileExplorerPinned
		})
	}

	ngOnDestroy(): void {
		this.isFileExplorerPinnedSubscription.unsubscribe()
	}

	updateSearchPanelMode = (searchPanelMode: SearchPanelMode) => {
		this.setSearchPanelMode(this.searchPanelMode === searchPanelMode ? "minimized" : searchPanelMode)
	}

	openSearchPanel() {
		this.setSearchPanelMode("treeView")
	}

	private closeSearchPanelOnOutsideClick = (event: MouseEvent) => {
		if (this.isOutside(event) && !this.isFileExplorerPinned) {
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
