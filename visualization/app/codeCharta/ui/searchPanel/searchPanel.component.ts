import "./searchPanel.component.scss"
import { CodeChartaMouseEventService } from "../../codeCharta.mouseEvent.service"

export type SearchPanelMode = "minimized" | "treeView" | "blacklist"

export class SearchPanelController {
	private _viewModel: {
		searchPanelMode: SearchPanelMode
	} = {
		searchPanelMode: "minimized"
	}

	constructor(private codeChartaMouseEventService: CodeChartaMouseEventService) {
		"ngInject"
		// Todo: Add Angular jest test after migration for this
		document.addEventListener("click", this.closeSearchPanelOnOutsideClick)
	}

	updateSearchPanelMode = (searchPanelMode: SearchPanelMode) => {
		this._viewModel.searchPanelMode = this._viewModel.searchPanelMode === searchPanelMode ? "minimized" : searchPanelMode

		this.codeChartaMouseEventService.closeComponentsExceptCurrent()
	}

	openSearchPanel() {
		this._viewModel.searchPanelMode = "treeView"
	}

	closeSearchPanelOnOutsideClick = (event: MouseEvent) => {
		if (this._viewModel.searchPanelMode === "minimized") {
			return
		}

		const elements = event.composedPath() as Node[]
		if (elements.every(element => element?.nodeName !== "SEARCH-PANEL-COMPONENT")) {
			this._viewModel.searchPanelMode = "minimized"
		}
	}
}

export const searchPanelComponent = {
	selector: "searchPanelComponent",
	template: require("./searchPanel.component.html"),
	controller: SearchPanelController
}
