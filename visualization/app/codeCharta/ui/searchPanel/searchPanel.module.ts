import "../../state/state.module"
import angular from "angular"
import { searchPanelComponent } from "./searchPanel.component"
import { downgradeComponent } from "@angular/upgrade/static"
import { SearchBarComponent } from "./searchBar/searchBar.component"
import { SearchPanelModeSelectorComponent } from "./searchPanelModeSelector/searchPanelModeSelector.component"
import { BlacklistPanelComponent } from "./blacklistPanel/blacklistPanel.component"

angular
	.module("app.codeCharta.ui.searchPanel", ["app.codeCharta.state"])
	.component(searchPanelComponent.selector, searchPanelComponent)
	.directive("ccSearchBar", downgradeComponent({ component: SearchBarComponent }))
	.directive("ccSearchPanelModeSelector", downgradeComponent({ component: SearchPanelModeSelectorComponent }))
	.directive("ccBlacklistPanel", downgradeComponent({ component: BlacklistPanelComponent }))
