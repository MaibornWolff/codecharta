import "../../state/state.module"
import angular from "angular"
import { searchBarComponent } from "./searchBar.component"
import "../../codeCharta.module"

angular
	.module("app.codeCharta.ui.searchBar", ["app.codeCharta.state", "app.codeCharta"])
	.component(searchBarComponent.selector, searchBarComponent)
