import "./searchPanel.component.scss"

export type SearchPanelMode = "minimized" | "treeView" | "blacklist"

export class SearchPanelController {
	private _viewModel: {
		searchPanelMode: SearchPanelMode
	} = {
		searchPanelMode: "minimized"
	}

	constructor() {
		"ngInject"
		document.addEventListener("mousedown", this.closeSearchPanelOnOutsideClick)
	}

	updateSearchPanelMode = (searchPanelMode: SearchPanelMode) => {
		this._viewModel.searchPanelMode = this._viewModel.searchPanelMode === searchPanelMode ? "minimized" : searchPanelMode
	}

	openSearchPanel() {
		this._viewModel.searchPanelMode = "treeView"
	}

	closeSearchPanelOnOutsideClick = (event: MouseEvent) => {
		if (this._viewModel.searchPanelMode !== "minimized" && this.isOutside(event)) {
			this._viewModel.searchPanelMode = "minimized"
		}
	}

	private isOutside(event: MouseEvent) {
		return event
			.composedPath()
			.every(
				element =>
					element["nodeName"] !== "SEARCH-PANEL-COMPONENT" &&
					element["nodeName"] !== "COLOR-CHROME" &&
					element["id"] !== "codemap-context-menu"
			)
	}
}

export const searchPanelComponent = {
	selector: "searchPanelComponent",
	template: require("./searchPanel.component.html"),
	controller: SearchPanelController
}
