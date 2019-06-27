import "../../state/state.module"
import angular from "angular"
import { searchBarComponent } from "./searchBar.component"

angular.module("app.codeCharta.ui.searchBar", ["app.codeCharta.state"])
    .component(searchBarComponent.selector, searchBarComponent)


