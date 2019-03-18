import angular from "angular";
import "angular-messages";
import "../../state/state.module";

import {mapTreeViewSearchComponent} from "./mapTreeViewSearch.component";

angular.module("app.codeCharta.ui.mapTreeViewSearch", ["app.codeCharta.state", "ngMessages"])
    .component(
        mapTreeViewSearchComponent.selector, mapTreeViewSearchComponent
    );
